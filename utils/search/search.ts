import { join } from "@std/path/join";
import { escape } from "@std/regexp/escape";
import { DOMParser } from "@b-fuze/deno-dom";
import { BetterMap } from "@retraigo/bettermap";
import { search as fuzzySearch } from "fast-fuzzy";

const cache: {
  documentsMap: BetterMap<string, string> | null;
  wordsPerFile: BetterMap<string, string> | null;
} = { documentsMap: null, wordsPerFile: null };

async function getData() {
  if (cache.documentsMap && cache.wordsPerFile)
    return { documentsMap: cache.documentsMap, wordsPerFile: cache.wordsPerFile };

  const stopList: string[] = (await Deno.readTextFile(join(Deno.cwd(), "utils/search/stoplist.txt"))).split("\n");

  // Combine all stoplist words into a single regex
  const stopWordsRegex = new RegExp(`\\b(${stopList.map(escape).join("|")})\\b`, "gi");

  /** fileId - filename */
  const documentsMap = new BetterMap<string, string>();
  for await (const file of Deno.readDir(join(Deno.cwd(), "static/files")))
    documentsMap.set(crypto.randomUUID(), file.name);

  /** fileId - text */
  const wordsPerFile: BetterMap<string, string> = new BetterMap();
  for (const [fileId, filename] of documentsMap) {
    const rawText = await Deno.readTextFile(join(Deno.cwd(), "static/files", filename));
    const document = new DOMParser().parseFromString(rawText, "text/html");

    let text = document.textContent.toLowerCase();

    // remove all new lines
    text = text.replace(/\n/g, " ");

    // Replace all stoplist words in one operation
    text = text.replaceAll(stopWordsRegex, " ");

    // remove all 1 letter words
    text = text.replaceAll(/\b\w\b/g, " ");
    // remove extra spaces
    text = text.replaceAll(/\s+/g, " ");

    wordsPerFile.set(fileId, text);
  }

  cache.documentsMap = documentsMap;
  cache.wordsPerFile = wordsPerFile;

  return { wordsPerFile, documentsMap };
}

export interface SearchResult {
  filename: string;
  match: [string, string, string];
  score: number;
}

export default async function search(searchTerm: string): Promise<SearchResult[]> {
  const { wordsPerFile, documentsMap } = await getData();

  const topTen = fuzzySearch(
    isNaN(parseInt(searchTerm)) ? searchTerm.toLowerCase() : `${searchTerm}.`,
    Array.from(wordsPerFile.entries()),
    {
      threshold: 0,
      ignoreCase: false,
      returnMatchData: true,
      keySelector: (e) => e[1],
      normalizeWhitespace: true,
    }
  ).slice(0, 10);

  const searchResults: SearchResult[] = [];

  for (const result of topTen) {
    const [fileId] = result.item;
    const filename = documentsMap.get(fileId);

    if (!filename) continue;

    const { index, length } = result.match;
    const score = result.score;

    const padding = 8;
    const match: SearchResult["match"] = [
      result.original.substring(Math.max(index - padding, 0), index),
      result.original.substring(index, index + length),
      result.original.substring(index + length, index + length + padding),
    ];

    searchResults.push({
      filename,
      match,
      score,
    });
  }

  return searchResults;
}
