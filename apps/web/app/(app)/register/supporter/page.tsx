export default function SupporterRegister() {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">サポーター登録（モック）</h3>
      <form className="space-y-2">
        <input className="w-full rounded border p-2" placeholder="氏名" />
        <input className="w-full rounded border p-2" placeholder="メール" />
        <button type="button" className="rounded bg-black px-4 py-2 text-white">
          仮登録
        </button>
      </form>
    </section>
  );
}
