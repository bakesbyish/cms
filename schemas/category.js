import { isUniqueAcrossAllDocuments } from "../lib/unique";

export default {
  title: "Categories",
  name: "categories",
  type: "document",
  fields: [
    {
      title: "Category title",
      name: "title",
      type: "string",
      validation: (Rule) => [
        Rule.required().min(3).error(
          "The category title must at least be greater than 3 characters",
        ),
        Rule.max(50).error("The category cannot be greater than 50 characters"),
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
          "A slug is required to uniquly indentify this category",
        ),
    },
    {
      title: "Category image",
      name: "image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) =>
        Rule.required().error(
          "An Image is required to identify the category visually",
        ),
    },
    {
      title: "Description",
      name: "description",
      type: "string",
      required: (Rule) => [
        Rule.required().min(15).error(
          "The description must be greater than 15 characters",
        ),
        Rule.max(300).error(
          "The description cannot be greater than 300 characters",
        ),
      ],
    },
  ],
};
