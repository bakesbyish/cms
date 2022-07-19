import { isUniqueAcrossAllDocuments } from "../lib/unique";
import measurement from "../lib/measurement";

export default {
  title: "Products",
  name: "products",
  type: "document",
  fields: [
    {
      title: "Product title",
      name: "title",
      type: "string",
      validation: (Rule) => [
        Rule.required().min(3).error(
          "The title must be greater than or equal to 3 characters",
        ),
        Rule.max(50).error("The title cannot be greater than 50 charcters"),
      ],
    },
    {
      title: "Slug",
      name: "slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 50,
        isUnique: isUniqueAcrossAllDocuments,
      },
      validation: (Rule) =>
        Rule.required().error(
          "A slug is required to uniquly identify a product",
        ),
    },
    {
      title: "SKU (Stock Keeeping Unit)",
      name: "sku",
      type: "number",
      validation: (Rule) =>
        Rule.required().error("The SKU is a required feild and must be unique"),
    },
    {
      title: "Catergories",
      name: "categories",
      type: "array",
      of: [{ type: "reference", to: { type: "categories" } }],
    },
    {
      title: "Image",
      name: "image",
      type: "image",
      options: {
        hotspot: true,
      },
      vlidation: (Rule) =>
        Rule.required().error(
          "An Image is required to visually identify the product",
        ),
    },
    {
      title: "Description",
      name: "description",
      type: "string",
      validation: (Rule) => [
        Rule.required().min(15).error(
          "A Description greater than 15 characters is required",
        ),
        Rule.max(300).error(
          "The description must be smaller than 300 characters",
        ),
      ],
    },
    {
      title: "Measurement unit",
      name: "unit",
      type: "string",
      options: {
        list: [
          ...measurement,
        ],
      },
      initialValue: measurement[0].value,
      validation: (Rule) =>
        Rule.custom((field) =>
          field === "undefined" ? "The measurement unit cannot be empty" : true
        ),
    },
    {
      title: "Price",
      name: "price",
      type: "number",
      validation: (Rule) =>
        Rule.required().error("Are you trying to sell items for free"),
    },
    {
      title: "Discounted",
      name: "discounted",
      type: "boolean",
      initialValue: false,
    },
    {
      title: "The minimum quantity to buy to qualify for the discount",
      name: "discountedFrom",
      type: "number",
      hidden: ({ document }) => !document?.discounted,
      validation: (Rule) => [
        Rule.custom((field, context) =>
          (context.document.discounted && field === undefined)
            ? "This feid cannot be empty when discounts are allowed"
            : true
        ),
        Rule.greaterThan(0).error("Must be greater than 0"),
        Rule.integer().error("Cannot have a decimal value"),
      ],
    },
    {
      title: "The price after the disocunt is applied",
      name: "discountedPrice",
      type: "number",
      hidden: ({ document }) => !document?.discounted,
      validation: (Rule) => [
        Rule.custom((field, context) =>
          (context.document.discounted && field === undefined)
            ? "This feid cannot be empty when discounts are allowed"
            : true
        ),
        Rule.greaterThan(0).error("Must be greater than 0"),
      ],
    },
    {
      title: "Trending",
      name: "trending",
      type: "boolean",
      initialValue: false,
    },
    {
      title: "Color",
      name: "productColors",
      type: "array",
      of: [{ type: "reference", to: { type: "colors" } }],
    },
    {
      title: "Variants",
      name: "productVariants",
      type: "array",
      of: [{ type: "reference", to: { type: "variants" } }],
    },
  ],
};
