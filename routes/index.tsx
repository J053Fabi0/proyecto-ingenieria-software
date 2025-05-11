import { Handlers, PageProps } from "$fresh/server.ts";
import { toFixedS } from "../utils/numbersString.ts";
import search, { SearchResult } from "../utils/search/search.ts";

interface Data {
  query?: string;
  searchResults?: SearchResult[];
}

export const handler: Handlers<Data> = {
  GET(_, ctx) {
    return ctx.render({});
  },
  async POST(req, ctx) {
    const searchParams = new URLSearchParams(await req.text());

    const query = searchParams.get("query");
    if (!query) return ctx.render({});

    const searchResults = await search(query);

    return ctx.render({ query, searchResults });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { query, searchResults } = data;

  return (
    <div class="px-4 py-8 mx-auto">
      <div class="max-w-screen-md mx-auto flex flex-col gap-4 items-center justify-center">
        <h1 class="text-4xl font-bold">Buscador de archivos</h1>

        <form method="post">
          <input type="text" name="query" value={query} class="border p-1" />
          <button type="submit" class="ml-1 px-2 py-1 bg-gray-100 border">
            Buscar
          </button>
        </form>

        {searchResults && searchResults.length === 0 && (
          <div class="text-gray-500">
            No se encontraron resultados para <strong>{query}</strong>
          </div>
        )}

        {searchResults &&
          searchResults.length > 0 &&
          searchResults.map((r) => (
            <a href={`/files/${r.filename}`} class="w-full flex flex-col gap-2" target="_blank">
              <section>
                <h2 class="text-2xl font-bold text-blue-500">{r.filename}</h2>
                <p class="text-gray-500">
                  {r.match[0]}
                  <strong>{r.match[1]}</strong>
                  {r.match[2]}
                </p>
                <p class="text-gray-500">Score: {`${toFixedS(r.score * 100, 1)}%`}</p>
              </section>
            </a>
          ))}
      </div>
    </div>
  );
}
