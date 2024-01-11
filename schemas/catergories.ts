import { defineField, defineType } from "sanity";
import { isUniqueAcrossAllDocuments } from "../lib/lib";
import { IoImageOutline } from "react-icons/io5";
import { Description } from "../components/Description";

export default defineType({
	title: "Catergories",
	name: "catergories",
	type: "document",
	fields: [
		defineField({
			title: "Title",
			name: "title",
			type: "string",
			validation: (rule) => [
				rule.required().error("Required"),
				rule.min(3).error("Title must be greater than 3 characters"),
				rule.max(50).error("Title must not be greater than 50 characters"),
			],
		}),
		defineField({
			title: "Slug",
			name: "slug",
			type: "slug",
			options: {
				source: "title",
				maxLength: 50,
				isUnique: isUniqueAcrossAllDocuments,
			},
			validation: (rule) => [rule.required().error("Required")],
		}),
		defineField({
			title: "Image",
			name: "image",
			type: "image",
			icon: IoImageOutline,
			options: {
				hotspot: true,
			},
			validation: (rule) => [
				rule
					.required()
					.error("An image is required to visually identify this product"),
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
	],
});
