import { defineField, defineType } from "sanity";

export const saleType = defineType({
  name: "sale",
  title: "Sales",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Sale Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Sale Description",
      type: "text",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
    }),
    defineField({
      name: "products",
      title: "Products on Sale",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
    }),
    defineField({
      name: "active",
      title: "Is Active?",
      type: "boolean",
      initialValue: true,
    }),
  ],
});
