import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | ToiNavi",
  description: "ToiNaviのプライバシーポリシーです。"
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-white px-5 py-5 shadow-sm ring-1 ring-slate-200/70">
      <h2 className="mb-3 text-[15px] font-black text-ink">{title}</h2>
      <div className="space-y-2 text-sm font-medium leading-7 text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
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
        <h1 className="mt-2 text-[28px] font-black leading-tight text-ink">プライバシーポリシー</h1>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-500">最終更新日：2026年5月24日</p>
      </header>

      <div className="space-y-3 px-4 pt-4">
        <Section title="ToiNaviについて">
          <p>
            ToiNavi（以下「本アプリ」）は、現在地や指定した場所の周辺にある公共トイレや施設内トイレを検索・表示するためのアプリです。
          </p>
        </Section>

        <Section title="取得する情報">
          <p>本アプリは以下の情報を取得・利用します。</p>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>
              <span className="font-bold text-ink">位置情報</span>
              ：現在地周辺のトイレを検索するために使用します。
            </li>
            <li>
              <span className="font-bold text-ink">レビュー投稿内容</span>
              ：評価・コメント等、ユーザーが入力した内容。
            </li>
            <li>
              <span className="font-bold text-ink">利用確認・通報内容</span>
              ：トイレの利用可否確認や問題報告の内容。
            </li>
          </ul>
        </Section>

        <Section title="位置情報の利用について">
          <p>
            取得した位置情報は、現在地周辺のトイレを検索・表示する目的にのみ使用します。第三者への提供や広告目的での利用は行いません。
          </p>
          <p>
            位置情報はアプリ使用中のみ取得します。バックグラウンドでの位置情報取得は行いません。
          </p>
        </Section>

        <Section title="投稿内容の保存">
          <p>
            レビュー投稿、利用確認、通報内容は、Supabase（クラウドデータベースサービス）に保存されます。投稿内容は、トイレ情報の精度向上および不正利用対策のために利用します。
          </p>
          <p className="rounded-2xl bg-amber-50 px-3 py-2.5 text-amber-800 ring-1 ring-amber-100">
            投稿内容には、氏名・住所・電話番号などの個人情報を記入しないようにしてください。
          </p>
        </Section>

        <Section title="外部データの利用">
          <p>
            掲載しているトイレ情報は、OpenStreetMap等の公開データをもとにしています。実際の利用可否・営業時間・設備情報は、現地の状況と異なる場合があります。
          </p>
          <p>
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              © OpenStreetMap contributors
            </a>
          </p>
        </Section>

        <Section title="情報の管理">
          <p>
            本アプリは、不正アクセス・漏えい・紛失等を防ぐため、適切な安全管理措置を講じます。ただし、インターネット経由の通信において完全な安全性を保証することはできません。
          </p>
        </Section>

        <Section title="ポリシーの変更">
          <p>
            本ポリシーは、法令の改正やサービス内容の変更に伴い、予告なく更新する場合があります。変更後のポリシーは、本ページへの掲載をもって効力を生じるものとします。
          </p>
        </Section>

        <Section title="お問い合わせ">
          <p>プライバシーポリシーに関するお問い合わせ先：</p>
          <p className="font-bold text-slate-500">準備中</p>
        </Section>
      </div>

      <BottomNav />
    </main>
  );
}
