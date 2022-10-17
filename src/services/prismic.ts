import * as prismicJS from '@prismicio/client'

export function getPrismicClient() {
  const prismic = prismicJS.createClient(process.env.PRISMIC_REPOSITORY_NAME, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  })


  return prismic;
}