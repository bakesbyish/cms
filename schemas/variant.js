export default {
  title: "Variants",
  name: "variants",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
      validation: (Rule) => [
        Rule.required().min(3).error(
          "A Title greater than 3 characters are required",
        ),
        Rule.max(50).error("The title cannot be greater than 50 characters"),
      ],
    },
    {
      title: "Image",
      name: "image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      title: "Price",
      name: "price",
      type: "number",
      validation: (Rule) => [
        Rule.required().error("Are you trying to sell items fro free"),
        Rule.greaterThan(0),
      ],
    },
    {
      title: "Discounted",
      name: "discounted",
      type: "boolean",
      initialValue: false,
    },
    {
      title: "The quanity that the discount applies from",
      name: "dicountedFrom",
      type: "number",
      hidden: ({ document }) => !document?.discounted,
      validation: (Rule) => [
        Rule.custom((field, context) =>
          (context.document.discounted && field === undefined)
            ? "This feild is required when disocunts are allowed"
            : true
        ),
        Rule.greaterThan(0).error(
          "Quantity cannot be smaller than 0, If you want to disable this feild then dont allow discounts",
        ),
        Rule.integer().error("Cannot have a decimal value"),
      ],
    },
    {
      title: "The price after the disocunt is applied",
      name: "dicountedPrice",
      type: "number",
      hidden: ({ document }) => !document?.discounted,
      validation: (Rule) => [
        Rule.custom((field, context) =>
          (context.document.discounted && field === undefined)
            ? "This feild is required when disocunts are allowed"
            : true
        ),
        Rule.greaterThan(0).error(
          "The discounted price must be greater than 0",
        ),
      ],
    },
    {
      title: "Colors",
      name: "variantColors",
      type: "array",
      of: [{ type: "reference", to: { type: "colors" } }],
    },
  ],
};
