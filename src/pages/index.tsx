import type { ReactElement } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {useAllDocsData} from '@docusaurus/plugin-content-docs/client';

type SidebarLink = {
  type: 'link';
  label: string;
  href: string;
  docId?: string;
  items?: never;
};

type SidebarCategory = {
  type: 'category';
  label: string;
  collapsible?: boolean;
  collapsed?: boolean;
  href?: string;
  docId?: string;
  items: SidebarItem[];
};

type SidebarItem = SidebarLink | SidebarCategory;

type VersionWithSidebars = {
  docsSidebars?: Record<string, SidebarItem[]>;
};

type CategorySummary = {
  label: string;
  href: string;
  count: number;
};

function flattenLinks(items: SidebarItem[]): SidebarLink[] {
  return items.flatMap((item) => {
    if (item.type === 'link') {
      return [item];
    }
    return flattenLinks(item.items);
  });
}

function getCategorySummaries(items: SidebarItem[]): CategorySummary[] {
  return items
    .filter((item): item is SidebarCategory => item.type === 'category')
    .map((category) => {
      const links = flattenLinks(category.items);
      const fallbackHref =
        category.href ??
        category.items.find(
          (entry): entry is SidebarLink => entry.type === 'link',
        )?.href ??
        links[0]?.href ??
        '/docs/intro';

      return {
        label: category.label,
        href: fallbackHref,
        count: links.length,
      };
    });
}

export default function Home(): ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const allDocs = useAllDocsData();
  const firstPlugin = Object.values(allDocs)[0];
  const currentVersion = firstPlugin?.versions[0] as VersionWithSidebars | undefined;
  const sidebarItems =
    currentVersion?.docsSidebars?.tutorialSidebar ?? [];

  const categories = getCategorySummaries(sidebarItems);
  const introLink = sidebarItems.find(
    (item): item is SidebarLink => item.type === 'link',
  );

  return (
    <Layout
      title={siteConfig.title}
      description="Справочный центр Хекслета">
      <header className="hero hero--primary">
        <div className="container padding-vert--xl">
          <Heading as="h1" className="hero__title">
            {siteConfig.title}
          </Heading>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          {introLink && (
            <div className="margin-top--md">
              <Link
                className="button button--secondary button--lg"
                to={introLink.href}>
                Начать отсюда
              </Link>
            </div>
          )}
        </div>
      </header>
      <main>
        <section className="container margin-vert--lg">
          <Heading as="h2" className="margin-bottom--lg text--center">
            Разделы базы знаний
          </Heading>
          <div className="row">
            {categories.map((category) => (
              <div
                className="col col--4 margin-bottom--lg"
                key={category.label}>
                <div className="card shadow--md">
                  <div className="card__body">
                    <Heading as="h3" className="margin-bottom--sm">
                      {category.label}
                    </Heading>
                    <p className="margin-bottom--sm">
                      {category.count} материалов
                    </p>
                    <Link
                      className="button button--primary button--sm"
                      to={category.href}>
                      Открыть
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
