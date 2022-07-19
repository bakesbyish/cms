import { isUniqueAcrossAllDocuments } from "../lib/unique";

export default {
  title: "Colors",
  name: "colors",
  type: "document",
  fields: [
    {
      title: "Color",
      name: "colorName",
      type: "string",
      validation: (Rule) => [
        Rule.required().min(3).error(
          "Color name of atleast 3 characters is required",
        ),
        Rule.max(50).error(
          "The color name cannot be greater than 50 characters",
        ),
      ],
    },
    {
      title: "Slug",
      name: "slug",
      type: "slug",
      options: {
        source: "colorName",
        maxLength: 50,
        isUnique: isUniqueAcrossAllDocuments,
      },
      validation: (Rule) =>
        Rule.required().error(
          "A Slug is required to uniqult identify this color",
        ),
    },
    {
      title: "Select the actual color",
      name: "colorHex",
      type: "color",
      validation: (Rule) =>
        Rule.required().error(
          "A color code is required to show the color to the end user",
        ),
    },
  ],
};
