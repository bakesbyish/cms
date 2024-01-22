import { IoColorPalette, IoImageOutline } from "react-icons/io5";
import { defineField, defineType } from "sanity";
import { isUniqueAcrossAllDocuments } from "../lib/lib";
import measurement from "../lib/measurement";

export default defineType({
	title: "Colors",
	name: "colors",
	type: "document",
	icon: IoColorPalette,
	fields: [
		defineField({
			title: "Color",
			name: "colorName",
			description: "Give the color a freindly name",
			type: "string",
			validation: (rule) => [
				rule.required().error("Required"),
				rule.max(50).error("Color name cannot be larger than 50 characters"),
				rule.min(3).error("Color name should not be smaller than 3 characters"),
			],
		}),
		defineField({
			title: "Slug",
			name: "slug",
			type: "slug",
			description:
				"This feature does not add any functionality improvements that you may notice it is for the developement side of the website, press the generate button and you will be good to go",
			options: {
				source: "colorName",
				maxLength: 50,
				isUnique: isUniqueAcrossAllDocuments,
			},
			validation: (rule) => [
				rule
					.required()
					.error("A slug is required to uniquely identify a color"),
			],
		}),
		defineField({
			title: "Has SKU",
			name: "hasSKU",
			type: "boolean",
			description:
				"Toggle this if there is an Price and SKU associated with the Color",
			initialValue: false,
		}),
		defineField({
			title: "In Stock",
			name: "hasStock",
			type: "boolean",
			hidden: (ctx) => !ctx.document?.hasSKU,
			description: "Toggle this off if only the specific color is out of stock",
			initialValue: true,
		}),
		defineField({
			title: "SKU (Stock Keeping Unit)",
			name: "sku",
			type: "string",
			hidden: (ctx) => !ctx.document?.hasSKU,
			validation: (rule) => [
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (document?.hasSKU && field === undefined) {
						return "SKU cannot be empty";
					}

					return true;
				}),
				rule.custom(async (sku, ctx) => {
					const { document, getClient } = ctx;
					if (!document?.hasSKU) {
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
		}),
		defineField({
			title: "Price",
			name: "price",
			type: "number",
			hidden: (ctx) => !ctx.document?.hasSKU,
			validation: (rule) => [
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (document?.hasSKU) {
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
			description:
				"Turn on this if there is an ongoing offer for the product. For example take the Lucky icing sugar as an example",
			initialValue: false,
			hidden: (ctx) => !ctx.document?.hasSKU,
		}),
		defineField({
			title: "Price after the offer",
			name: "priceAfterOffer",
			type: "number",
			hidden: (ctx) => !ctx.document?.hasOffer,
			validation: (rule) => [
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (document?.hasOffer && field === undefined) {
						return "Please enter the reduced offer price";
					}
					return true;
				}),
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (
						document?.hasOffer &&
						field &&
						(document.price as number) <= field
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
			hidden: (ctx) => !ctx.document?.hasSKU,
			type: "boolean",
			initialValue: false,
		}),
		defineField({
			title: "Measurement unit",
			name: "unit",
			type: "string",
			description:
				"The measurement unit that is used to measure items the deafult measurement unit is pieces",
			options: {
				list: [...measurement],
			},
			hidden: (ctx) => !ctx.document?.hasWholesalePrice,
			initialValue: measurement[0].value,
			validation: (rule) => [
				rule.custom((field) =>
					field === "undefined" ? "The measurement unit cannot be empty" : true,
				),
			],
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
					if (
						document?.hasWholesalePrice &&
						document?.qualifyingQty &&
						field === undefined
					) {
						return "You must set a quantity if your have enabled wholesale specification";
					}

					return true;
				}),
				rule.custom((field, ctx) => {
					const { document } = ctx;
					if (
						document?.hasWholesalePrice &&
						document?.unit === measurement[0].value
					) {
						if (Number.isInteger(field)) {
							return true;
						}

						return "Pieces cannot be sold as parts";
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
			title: "Select the color",
			name: "colorHex",
			type: "color",
			description: "Select a color from the color palate",
			options: {
				disableAlpha: true,
			},
			validation: (rule) => [rule.required().error("You must select a color")],
		}),
	],
});
