import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { colorInput } from "@sanity/color-input";

export default defineConfig({
	name: "default",
	title: "bakesbyish",

	projectId: "7p2xutc1",
	dataset: "production",

	plugins: [
		structureTool({
			structure: (S) => {
				return S.list()
					.title("Content")
					.items([
						...S.documentTypeListItems().filter(
							(item) =>
								item.getId() !== "colors" && item.getId() !== "varients",
						),
						S.divider(),
						...S.documentTypeListItems().filter(
							(item) =>
								item.getId() !== "products" && item.getId() !== "catergories",
						),
					]);
			},
		}),
		visionTool(),
		colorInput(),
	],

	schema: {
		types: schemaTypes,
	},
});
