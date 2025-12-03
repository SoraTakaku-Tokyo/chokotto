export const getAgeGroup = (birthday: Date): string => {
  const today = new Date();

  // ざっくり年齢算出
  let age = today.getFullYear() - birthday.getFullYear();

  // 誕生日が来ているかのチェック
  const hasBirthdayPassed =
    today.getMonth() > birthday.getMonth() ||
    (today.getMonth() === birthday.getMonth() && today.getDate() >= birthday.getDate());

  // 誕生日まだなら１歳引く
  if (!hasBirthdayPassed) {
    age--;
  }

  // 年代（10の位）に直す
  const decade = Math.floor(age / 10) * 10;
  return `${decade}代`;
};
