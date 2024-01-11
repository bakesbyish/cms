import { SlugValidationContext } from "sanity";

export async function isUniqueAcrossAllDocuments(
	slug: string,
	ctx: SlugValidationContext,
) {
	const { document, getClient } = ctx;
	const client = getClient({
		apiVersion: "2023-08-01",
	});

	const id = document?._id.replace(/^drafts\./, "");
	const params = {
		draft: `drafts.${id}`,
		published: id,
		slug,
	};

	// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
	const query = `!defined(*[!(_id in [$draft, $published]) && slug.current == $slug][0]._id)`;
	const result = await client.fetch(query, params);
	return result;
}
