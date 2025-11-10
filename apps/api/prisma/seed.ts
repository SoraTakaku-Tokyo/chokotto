// prisma/seed.ts
import { PrismaClient, RequestStatus, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

// menu説明の長文整形用
const dedent = (s: TemplateStringsArray, ...vals: unknown[]) => {
  const raw = String.raw(s, ...vals);
  const lines = raw.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  const indent = lines
    .filter((l) => l.trim())
    .reduce((min, l) => Math.min(min, l.match(/^(\s*)/)?.[1].length ?? 0), Infinity);
  return lines.map((l) => l.slice(indent)).join("\n");
};

async function main() {
  // --- Users ---
  const users = await prisma.user.createMany({
    data: [
      {
        id: "ZP6l5FZf8uMMnPHRcoOHGIjUD6o1",
        identityVerified: true,
        role: "user",
        familyName: "井上",
        firstName: "節子",
        familyNameKana: "イノウエ",
        firstNameKana: "セツコ",
        birthday: new Date("1945-09-03"),
        gender: "女性",
        email: "testuser1@example.com",
        phoneNumber: "090-1111-1111",
        postalCode: "179-0071",
        address1: "旭町1丁目",
        address2: "42-55",
        emergencyContactName: "井上幸則",
        emergencyContactPhone: "090-2222-2222",
        emergencyContactRelationship: "子",
        profileImageUrl: "/sampleuser6.png",
        bio: "難聴があり聞き取りにくいので、ゆっくり話してください。",
        centerId: "C001"
      },
      {
        id: "MnF4AGXUopMCX8RgYa5hqY7Dsam1",
        identityVerified: true,
        role: "user",
        familyName: "山本",
        firstName: "法子",
        familyNameKana: "ヤマモト",
        firstNameKana: "ノリコ",
        birthday: new Date("1944-10-11"),
        gender: "女性",
        email: "testuser2@example.com",
        phoneNumber: "090-7777-7777",
        postalCode: "178-0061",
        address1: "大泉学園町9丁目",
        address2: "77-8",
        emergencyContactName: "山本知子",
        emergencyContactPhone: "090-8888-8888",
        emergencyContactRelationship: "子",
        profileImageUrl: "/sampleuser4.png",
        bio: "庭で大きい犬を飼っています。",
        centerId: "C001"
      },
      {
        id: "K5w5gAs2mlaht0AzK5LP15DgD7x1",
        identityVerified: true,
        role: "supporter",
        familyName: "木下",
        firstName: "亜里沙",
        familyNameKana: "キノシタ",
        firstNameKana: "アリサ",
        birthday: new Date("2004-11-29"),
        gender: "女性",
        email: "testuser3@example.com",
        phoneNumber: "080-3333-3333",
        postalCode: "178-0071",
        address1: "旭町2丁目",
        address2: "33-44",
        emergencyContactName: "木下俊美",
        emergencyContactPhone: "090-4444-4444",
        emergencyContactRelationship: "母",
        profileImageUrl: "/sampleuser3.png",
        bio: "お役に立てると嬉しいです！",
        centerId: "C001"
      },
      {
        id: "C31Sv6MkE9ZS8YzNzvWxtMy0oOT2",
        identityVerified: true,
        role: "user",
        familyName: "伊藤",
        firstName: "和夫",
        familyNameKana: "イトウ",
        firstNameKana: "カズオ",
        birthday: new Date("1943-02-10"),
        gender: "男性",
        email: "testuser4@example.com",
        phoneNumber: "080-5555-5555",
        postalCode: "177-0035",
        address1: "南田中4丁目",
        address2: "66-22",
        emergencyContactName: "伊藤雄二",
        emergencyContactPhone: "090-6666-6666",
        emergencyContactRelationship: "子",
        profileImageUrl: "/sampleuser2.png",
        bio: "歩くのがゆっくりなので、玄関で少しお待たせするかもしれません。",
        centerId: "C001"
      }
    ]
  });

  console.log(`✅ Users inserted: ${users.count}`);

  // --- Requests ---
  await prisma.request.createMany({
    data: [
      {
        userId: "MnF4AGXUopMCX8RgYa5hqY7Dsam1",
        title: "買い物代行",
        description: "犬のペットフードを買ってきて欲しい",
        status: RequestStatus.open,
        requestedAt: new Date(),
        scheduledDate: new Date("2025-11-07"),
        scheduledStartTime: "12:00",
        scheduledEndTime: "14:00",
        workLocation1: "おまかせ",
        workLocation2: "大泉学園町9丁目",
        centerId: "C001"
      },
      {
        userId: "C31Sv6MkE9ZS8YzNzvWxtMy0oOT2",
        title: "買い物代行",
        description: "同じ蛍光灯の替えを買ってきてほしいです",
        status: RequestStatus.open,
        requestedAt: new Date(),
        scheduledDate: new Date("2025-11-10"),
        scheduledStartTime: "09:00",
        scheduledEndTime: "12:00",
        workLocation1: "イオン",
        workLocation2: "南田中４丁目",
        centerId: "C001"
      },
      {
        userId: "MnF4AGXUopMCX8RgYa5hqY7Dsam1",
        title: "買い物代行",
        description: "当日リストをお渡しします",
        status: RequestStatus.open,
        requestedAt: new Date(),
        scheduledDate: new Date("2025-11-12"),
        scheduledStartTime: "14:00",
        scheduledEndTime: "14:30",
        workLocation1: "サミー",
        workLocation2: "大泉学園町9丁目",
        centerId: "C001"
      }
    ]
  });

  console.log("✅ Requests inserted");

  // --- Orders ---
  await prisma.order.createMany({
    data: [
      { requestId: 1, supporterId: "MnF4AGXUopMCX8RgYa5hqY7Dsam1", status: OrderStatus.refusal }
    ]
  });

  console.log("✅ Orders inserted");

  // --- Menu ---
  const userDescriptionM001 = dedent`
    サポーターさんへ買い物リスト（メモ）と現金を渡してください。買い物後、品物・おつり・レシートを受け取ります。
    購入先のお店を指定できますが、サポーターさんにお任せすることもできます。
    売り切れの場合は電話するのかなど、サポーターさんと相談してください。
    サポーターによる立替払いはできません。
    買い物個数は10品までです。
    公共交通機関を利用する場合は、サポーターさんの交通費は利用者が負担してください。
    交通費は切符（現金支払い）した場合の実費を、当日サポーターさんへ渡してください。
  `;

  const supporterDescriptionM001 = dedent`
    利用者から買い物リスト（メモ）と現金を受け取ってください。買い物後、品物・おつり・レシートを利用者へ渡します。
    利用者は購入先のお店を指定できますが、指定されていないこともあります。
    売り切れの場合は電話するのかなど、利用者と相談してください。
    立替払いは不可です。
    買い物個数は10品までです。
    公共交通機関を利用する場合は、交通費は利用者負担です。
  `;

  await prisma.menu.createMany({
    data: [
      {
        name: "買い物代行",
        userDescription: userDescriptionM001,
        supporterDescription: supporterDescriptionM001
      },
      {
        name: "外出付き添い",
        userDescription: "選択できません",
        supporterDescription: "選択できません"
      },
      {
        name: "室内軽作業（15分まで）",
        userDescription: "選択できません",
        supporterDescription: "選択できません"
      },
      {
        name: "屋外軽作業（30分まで）",
        userDescription: "選択できません",
        supporterDescription: "選択できません"
      },
      {
        name: "掃除・片付け（1時間まで）",
        userDescription: "選択できません",
        supporterDescription: "選択できません"
      },
      {
        name: "話し相手（2時間まで）",
        userDescription: "選択できません",
        supporterDescription: "選択できません"
      }
    ]
  });

  console.log("✅ Menu inserted");

  // --- Center ---
  await prisma.center.create({
    data: {
      id: "C001",
      name: "さくらボランティアセンター",
      email: "sakura@xxxxx.go.jp",
      phoneNumber: "00-0000-0000",
      postalCode: "999-9999",
      address1: "〇〇市1丁目",
      address2: "〇ー〇",
      isActive: true
    }
  });

  console.log("✅ Center inserted");
}

main()
  .then(async () => {
    console.log("🌱 Seeding complete!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
