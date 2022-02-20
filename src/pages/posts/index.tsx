import React from "react";
import Head from "next/head";
import { GetStaticProps } from "next";
import Prismic from "@prismicio/client";
import Link from "next/link";
import { RichText } from "prismic-dom";

import { getPrismicClient } from "../../services/prismic";

import styles from "./styles.module.scss";
import { Document } from "@prismicio/client/types/documents";

type PostTitle = {
  type: string;
  text: string;
  spans: [];
};

type PostContentSpan = {
  start: number;
  end: number;
  type: string;
};

type PostContent = {
  type: string;
  text: string;
  spans: PostContentSpan[];
};

type PostResult = {
  title: PostTitle[];
  content: PostContent[];
};

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

type PostsProps = {
  posts: Post[];
};

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link href={`/posts/${post.slug}`} passHref key={post.slug}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query(
    [Prismic.predicates.at("document.type", "publication")],
    {
      fetch: ["publication.title", "publication.content"],
      pageSize: 100,
    }
  );

  const posts = response.results.map((post: Document<PostResult>) => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt:
        post.data.content.find((content) => content.type === "paragraph")
          ?.text ?? "",
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });

  return {
    props: { posts },
  };
};
