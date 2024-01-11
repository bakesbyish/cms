import { defineField, defineType } from "sanity";
import { isUniqueAcrossAllDocuments } from "../lib/lib";
import { GrCatalog } from "react-icons/gr";
import { IoImageOutline } from "react-icons/io5";
import measurement from "../lib/measurement";
import { Description } from "../components/Description";

export default defineType({
	title: "Products",
	name: "products",
	type: "document",
	icon: GrCatalog,
	fields: [
		defineField({
			title: "Title",
			name: "title",
			type: "string",
			description: "This is the name of the product",
			validation: (rule) => [
				rule.required().error("Required"),
				rule.min(3).error("Should have more than 3 characters"),
				rule.max(50).error("Should not have more than 50 chracters"),
			],
		}),
		defineField({
			title: "Slug",
			name: "slug",
			type: "slug",
			description:
				"This feature does not add any functionality improvements that you may notice it is for the developement side of the website, press the generate button and you will be good to go",
			options: {
				source: "title",
				maxLength: 50,
				isUnique: isUniqueAcrossAllDocuments,
			},
			validation: (rule) => [rule.required().error("Required")],
		}),
		defineField({
			title: "Images",
			name: "images",
			type: "array",
			icon: IoImageOutline,
			description: "The image is used to visually identify the product",
			of: [
				{
					type: "image",
				},
			],
			options: {
				layout: "grid",
			},
			validation: (rule) => [
				rule
					.required()
					.error("An image is required to visually identify the product"),
			],
		}),
		defineField({
			title: "Description",
			name: "description",
			description:
				"Even through the description is not required is it often considered as good practice to include a description for Google to index the products and show it on the google search results",
			type: "string",
			components: {
				input: Description,
			},
			validation: (rule) => [
				rule
					.max(3000)
					.error("Description cannot be larger than 3000 characters"),
			],
		}),
		defineField({
			title: "Measurment Unit",
			name: "unit",
			type: "string",
			description:
				"The measurement unit that is used to measure items the deafult measurement unit is pieces",
			options: {
				list: [...measurement],
			},
			initialValue: measurement[0].value,
			validation: (rule) => [
				rule.custom((field) =>
					field === "undefined" ? "The measurement unit cannot be empty" : true,
				),
			],
		}),
		defineField({
			title: "Has Varients",
			name: "hasVarients",
			type: "boolean",
			description:
				"Toggle this if there are variations for the given product, For example Pipping bags",
			initialValue: false,
		}),
		defineField({
			title: "Varients",
			name: "variations",
			type: "array",
			hidden: (ctx) => !ctx.document?.hasVarients,
			of: [
				{
					type: "reference",
					to: {
						type: "varients",
					},
				},
			],
		}),
		defineField({
			title: "SKU (Stock Keeping Unit)",
			name: "sku",
			type: "string",
			hidden: (ctx) => (ctx.document?.hasVarients ? true : false),
			validation: (rule) => [
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (!document?.hasVarients && field === undefined) {
						return "SKU cannot be empty";
					}

					return true;
				}),
				rule.custom(async (sku, ctx) => {
					const { document, getClient } = ctx;
					if (document?.hasVarients) {
						return true;
					}
					const client = getClient({
						apiVersion: "2023-08-01",
					});

					const id = document?._id.replace(/^drafts\./, "");
					const params = {
						draft: `drafts.${id}`,
						published: id,
						sku,
					};

					// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
					const query = `!defined(*[!(_id in [$draft, $published]) && sku == $sku][0]._id)`;
					const result = (await client.fetch(query, params)) as string;
					if (!result) {
						return "Item with the given SKU already exists";
					}

					return true;
				}),
			],
		}),
		defineField({
			title: "Price",
			name: "price",
			type: "number",
			hidden: (ctx) => (ctx.document?.hasVarients ? true : false),
			validation: (rule) => [
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (!document?.hasVarients) {
						if (!field) {
							return "Price cannot be kept empty";
						}

						if (field <= 0) {
							return "Price cannot be 0 or less than that";
						}

						return true;
					}

					return true;
				}),
			],
		}),
		defineField({
			title: "Has offer",
			name: "hasOffer",
			type: "boolean",
			hidden: (ctx) => (ctx.document?.hasVarients ? true : false),
			description:
				"Turn on this if there is an ongoing offer for the product. For example take the Lucky icing sugar as an example",
			initialValue: false,
		}),
		defineField({
			title: "Price after the offer",
			name: "priceAfterOffer",
			type: "number",
			hidden: (ctx) => !ctx.document?.hasOffer,
			validation: (rule) => [
				rule.custom((field, ctx) => {
					if (ctx.document?.hasOffer && field === undefined) {
						return "Please enter the reduced offer price";
					}
					return true;
				}),
				rule.custom((field, ctx) => {
					if (
						ctx.document &&
						field &&
						(ctx.document.price as number) <= field
					) {
						return "The offer price should be smaller than the regular price";
					}

					return true;
				}),
			],
		}),
		defineField({
			title: "Has wholesale price",
			name: "hasWholesalePrice",
			description:
				"Turn on this field if the price of the product varies when he/she buy say for example 12 items. If you have offer turned on this discount amount will be based on the offer price",
			hidden: (ctx) => (ctx.document?.hasVarients ? true : false),
			type: "boolean",
			initialValue: false,
		}),
		defineField({
			title: "Qualifying quantity",
			name: "qualifyingQty",
			type: "number",
			description:
				"Items that he/she needs to buy to unlock the wholesale price",
			hidden: (ctx) => !ctx.document?.hasWholesalePrice,
			validation: (rule) => [
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (document?.qualifyingQty && field === undefined) {
						return "You must set a quantity if your have enabled wholesale specification";
					}

					return true;
				}),
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (document) {
						if (!document.hasWholesalePrice) {
							return true;
						}

						if (document.unit === measurement[0]) {
							if (Number.isInteger(field)) {
								return true;
							}

							return "Pieces cannot be sold as parts";
						}
					}

					return true;
				}),
				rule.greaterThan(0).error("Quantity must be greater than 0"),
			],
		}),
		defineField({
			title: "Wholesale price",
			name: "wholesalePrice",
			type: "number",
			description:
				"The price of a single unit when buying the qualifying amount for the wholesale purchase",
			hidden: (ctx) => !ctx.document?.hasWholesalePrice,
			validation: (rule) => [
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (document) {
						if (document.hasWholesalePrice) {
							if (field === undefined) {
								return "Price cannot be empty";
							}
						}
						const price = field as number;

						if (document.hasOffer) {
							// @ts-ignore
							if (price >= document.priceAfterOffer) {
								return "Wholesale price cannot be larger than the offer price";
							}

							return true;
						}

						// @ts-ignore
						if (price >= document.price) {
							return "Wholesale price cannot be larger than regular price";
						}

						return true;
					}

					return true;
				}),
			],
		}),
		defineField({
			title: "Color",
			name: "productColors",
			type: "array",
			hidden: (ctx) => (ctx.document?.hasVarients ? true : false),
			description: "Chose the colors in which the product is available",
			of: [
				{
					type: "reference",
					to: {
						type: "colors",
					},
				},
			],
		}),
		defineField({
			title: "Catergory",
			name: "catergories",
			type: "array",
			description:
				"Catergorize the products to make it easier for customers to search through products",
			of: [{ type: "reference", to: { type: "catergories" } }],
		}),
	],
});
