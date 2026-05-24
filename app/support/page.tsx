import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, Bug, FileWarning, MessageSquareText } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "サポート | ToiNavi",
  description: "ToiNaviのサポートページです。不具合報告や掲載情報の誤り報告を受け付けています。"
};

function Section({
  icon: Icon,
  title,
  children
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-white px-5 py-5 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-black text-ink">
        {Icon ? <Icon size={16} className="text-accent" /> : null}
        {title}
      </h2>
      <div className="space-y-2 text-sm font-medium leading-7 text-slate-600">{children}</div>
    </section>
  );
}

export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-slate-50 pb-32">
      <header className="rounded-b-[30px] bg-white px-4 pb-5 pt-5 shadow-sm ring-1 ring-slate-200/70">
        <Link
          href="/"
          className="mb-4 flex items-center gap-1.5 text-xs font-black text-slate-400 transition hover:text-accent"
        >
          <ArrowLeft size={14} />
          ホームへ戻る
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Help</p>
        <h1 className="mt-2 text-[28px] font-black leading-tight text-ink">サポート</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
          ToiNavi — 現在地から近くのトイレを探せるアプリ
        </p>
      </header>

      <div className="space-y-3 px-4 pt-4">
        <Section title="ToiNaviとは">
          <p>
            ToiNaviは、現在地や指定した場所の周辺にある公共トイレ・施設内トイレを地図と一覧で確認できるアプリです。距離・徒歩時間・設備情報・ユーザーレビューをもとに、目的に合ったトイレを素早く見つけることができます。
          </p>
        </Section>

        <Section icon={Bug} title="不具合を報告する">
          <p>以下の内容をお知らせください。</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>発生した問題の詳細</li>
            <li>操作手順（再現方法）</li>
            <li>使用端末・OSバージョン</li>
            <li>ブラウザ名とバージョン（Webの場合）</li>
          </ul>
          <p className="mt-1">下記お問い合わせ先までご連絡ください。</p>
        </Section>

        <Section icon={FileWarning} title="掲載情報の誤りを報告する">
          <p>
            トイレ情報に誤りがある場合は、各トイレの詳細ページ内にある「問題を報告する」ボタンからご報告ください。
          </p>
          <p>
            報告項目として「場所が間違っている」「閉鎖・廃止されている」「設備情報が違う」等を選択できます。
          </p>
          <p className="rounded-2xl bg-slate-50 px-3 py-2.5 text-slate-600 ring-1 ring-slate-200">
            掲載情報はOpenStreetMap等の公開データをもとにしています。情報修正はOpenStreetMapへの貢献としても反映されます。
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="ml-1 underline"
            >
              © OpenStreetMap contributors
            </a>
          </p>
        </Section>

        <Section icon={MessageSquareText} title="フィードバック">
          <p>機能要望・改善提案などのフィードバックも歓迎します。</p>
          <p>お問い合わせ先（下記）までお気軽にご連絡ください。</p>
        </Section>

        <Section title="お問い合わせ">
          <p>ご質問・不具合報告・情報誤りの報告はこちらへ：</p>
          <a
            href="mailto:toinavi012@gmail.com"
            className="font-bold text-accent underline"
          >
            toinavi012@gmail.com
          </a>
        </Section>

        <Section title="ご利用上の注意">
          <p>
            掲載しているトイレ情報は公開データをもとにしており、実際の利用可否・営業時間・設備情報は現地の状況と異なる場合があります。ご利用前に現地でご確認ください。
          </p>
          <p>店舗・施設内のトイレは、施設のルールに従ってご利用ください。</p>
        </Section>
      </div>

      <BottomNav />
    </main>
  );
}
