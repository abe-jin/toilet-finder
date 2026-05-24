import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "利用規約 | ToiNavi",
  description: "ToiNaviの利用規約です。"
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-white px-5 py-5 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="mb-3 text-[15px] font-black text-ink">{title}</h2>
      <div className="space-y-2 text-sm font-medium leading-7 text-slate-600">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
        <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Legal</p>
        <h1 className="mt-2 text-[28px] font-black leading-tight text-ink">利用規約</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">最終更新日：2026年5月24日</p>
      </header>

      <div className="space-y-3 px-4 pt-4">
        <Section title="はじめに">
          <p>
            本利用規約（以下「本規約」）は、ToiNavi（以下「本アプリ」）の利用条件を定めるものです。本アプリをご利用いただくことで、本規約に同意いただいたものとみなします。
          </p>
        </Section>

        <Section title="掲載情報の正確性">
          <p>
            本アプリに掲載しているトイレ情報は、OpenStreetMap等の公開データをもとにしています。掲載情報の正確性・完全性・最新性を保証するものではありません。
          </p>
          <p>
            実際の利用可否・営業時間・設備情報は、現地の状況と異なる場合があります。必ず現地でご確認ください。
          </p>
        </Section>

        <Section title="ご利用上のルール">
          <p>ご利用にあたり、以下の点をお守りください。</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>表示されたトイレを利用する際は、施設・店舗のルールに従ってください。</li>
            <li>店舗・施設内のトイレは、施設の定める利用条件に従ってください。</li>
            <li>実際の利用可否は現地状況をご確認の上、ご判断ください。</li>
          </ul>
        </Section>

        <Section title="投稿内容について">
          <p>レビュー・利用確認・通報などの投稿を行う際は、以下を禁止します。</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>虚偽・誇張・誤解を招く内容の投稿</li>
            <li>他者への誹謗中傷・差別的表現を含む投稿</li>
            <li>個人情報（氏名・住所・電話番号等）を含む投稿</li>
            <li>広告・宣伝・スパム目的の投稿</li>
            <li>その他、公序良俗に反する内容の投稿</li>
          </ul>
          <p>不適切な投稿は予告なく削除する場合があります。</p>
        </Section>

        <Section title="免責事項">
          <p>
            本アプリの利用により生じたいかなる損害についても、運営者は責任を負いかねます。掲載情報を参考にした行動はご自身の判断と責任において行ってください。
          </p>
        </Section>

        <Section title="サービスの変更・停止">
          <p>
            運営者は、予告なく本アプリの内容を変更、または提供を停止・終了する場合があります。これにより生じた損害について、運営者は責任を負いかねます。
          </p>
        </Section>

        <Section title="規約の変更">
          <p>
            本規約は、法令の改正やサービス内容の変更に伴い、予告なく更新する場合があります。変更後の規約は、本ページへの掲載をもって効力を生じるものとします。
          </p>
        </Section>

        <Section title="お問い合わせ">
          <p>本規約に関するお問い合わせ先：</p>
          <a
            href="mailto:toinavi012@gmail.com"
            className="font-bold text-accent underline"
          >
            toinavi012@gmail.com
          </a>
        </Section>

        <div className="flex gap-3 pb-2">
          <Link
            href="/privacy"
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-accent shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50"
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/support"
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-center text-sm font-black text-slate-600 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50"
          >
            サポート
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
