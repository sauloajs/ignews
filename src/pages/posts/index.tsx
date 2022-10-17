import Head from "next/head";
import styles from "./styles.module.scss";
import { GetStaticProps } from 'next';
import { getPrismicClient } from "../../services/prismic";
import * as prismicJS from "@prismicio/client";
import { RichText } from "prismic-dom";

type Post = {
  id: string;
  title: string;
  excerpt?: string;
  updatedAt: string;
}

interface PostProps {
  posts: Post[]
}

export default function Posts({ posts }) {
  return (
    <>
      <Head>
        <title>Posts | ig.news</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {
            posts.map(post => (
                <a key={post.id} href="">
                  <time>{post.updatedAt}</time>
                  <strong>{post.title}</strong>
                  <p>{post.excerpt}</p>
                </a>
              )
            )
          }
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.get({
    predicates: prismicJS.predicate.at('document.type', 'post'),
    fetch: ['post.title', 'post.content'],
    pageSize: 100
  })

  const fs = require('fs')

  fs.writeFileSync('posts.json', JSON.stringify(response));

  const posts = response.results.map(post => {
    return {
      id: post.id,
      title: RichText.asText(post.data.title),
      excerpt: post.data.content ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {
      posts
    }
  }
}