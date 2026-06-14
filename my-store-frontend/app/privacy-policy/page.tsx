import Link from 'next/link';
import ScrollToTop from './ScrollToTop'; // استيراد المكون المنفصل

interface ListItem {
  item: string;
}

interface Section {
  sectionTitle: string;
  type: 'text' | 'list' | 'text_with_list';
  content?: string;
  listItems?: ListItem[];
}

export const metadata = {
  title: 'سياسة الخصوصية - بيت الود',
  description: 'تعرف على سياسة الخصوصية لمتجر بيت الود للأثاث.',
};

async function getPrivacyPolicy() {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/privacy-policy?populate[sections][populate]=listItems`,
      { cache: 'no-store' }
    );
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error('خطأ في جلب سياسة الخصوصية:', error);
    return null;
  }
}

export default async function PrivacyPolicyPage() {
  const data = await getPrivacyPolicy();
  const sections = data?.sections || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-pink-50 py-16" dir="rtl">
      <ScrollToTop /> {/* استخدام المكون هنا */}
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium mb-8 transition-colors group"
        >
          <svg
            className="ml-2 w-5 h-5 transform rotate-180 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          العودة إلى الرئيسية
        </Link>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-600 to-pink-500 h-3"></div>

          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-[900] text-slate-900 mb-6 text-center">
              سياسة <span className="bg-gradient-to-l from-blue-600 to-pink-500 bg-clip-text text-transparent">الخصوصية</span>
            </h1>

            {sections.length === 0 ? (
              <p className="text-center text-gray-500">لا توجد أقسام بعد.</p>
            ) : (
              <div className="space-y-8 text-gray-700 leading-relaxed">
                {sections.map((section: Section, index: number) => {
                  if (!section.sectionTitle || !section.type) return null;

                  if (section.type === 'text' && section.content) {
                    return (
                      <section key={index}>
                        <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          {section.sectionTitle}
                        </h2>
                        <p
                          className="mr-4"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      </section>
                    );
                  }

                  if (section.type === 'list' && (section.listItems ?? []).length > 0) {
                    return (
                      <section key={index}>
                        <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          {section.sectionTitle}
                        </h2>
                        <ul className="list-disc mr-8 space-y-2">
                          {(section.listItems ?? []).map((listItem: ListItem, i: number) => (
                            <li key={i}>{listItem.item}</li>
                          ))}
                        </ul>
                      </section>
                    );
                  }

                  if (section.type === 'text_with_list' && section.content && (section.listItems ?? []).length > 0) {
                    return (
                      <section key={index}>
                        <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                          {section.sectionTitle}
                        </h2>
                        <p
                          className="mr-4 mb-4"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                        <ul className="list-disc mr-8 space-y-2">
                          {(section.listItems ?? []).map((listItem: ListItem, i: number) => (
                            <li key={i}>{listItem.item}</li>
                          ))}
                        </ul>
                      </section>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 