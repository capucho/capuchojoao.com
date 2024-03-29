import Link from 'next/link';
import Head from 'next/head';

import Layout, { siteTitle } from '../components/layout';
import Date from '../components/date';

import utilStyles from '../styles/utils.module.css';

import { getSortedPostsData } from '../lib/posts';

const ELEMENTS_TO_DISPLAY = 3
export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Brazilian, Software Engineer (Node.js, AWS) based in Stockholm, Sweden.</p>
        <p>
          I write about tech and books. But I also like to make pizza, try new vegan recipes, read &amp; DIY. If my cat allows :)
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Latest Posts &nbsp;- &nbsp;
        <Link href="/posts">
          <a>See all</a>
        </Link>
      </h2>

        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href="/posts/[id]" as={`/posts/${id}`}>
                <a>{title}</a>
              </Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

// getStaticProps runs only on the server-side.
export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData: allPostsData.slice(0, ELEMENTS_TO_DISPLAY),
    },
  };
}
