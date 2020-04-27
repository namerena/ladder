import validate = WebAssembly.validate;

const invalidClanChar = /[\u0000-\u001F+@\\\/?%*"|:<>]/;
const invalidNameChar = /[\u0000-\u001F+@"]/;

function tooLong(str: string) {
  if (str.length > 20) {
    return true;
  }
  let doubles = 0;
  for (let i = 0; i < str.length; ++i) {
    if (str.charCodeAt(i) > 255) {
      ++doubles;
    }
  }
  if (doubles + str.length > 20) {
    return true;
  }
  return false;
}

export function validateNameChange(
  data: any
): {clan?: string; names?: string[]; password?: string; create?: boolean} | string {
  if (!data || data.constructor !== Object) {
    return {};
  }
  let {names: namestr, clan, password, create} = data;
  if (
    typeof namestr !== 'string' ||
    typeof clan !== 'string' ||
    typeof password !== 'string' ||
    typeof create !== 'boolean' ||
    password.length < 1
  ) {
    return '输入格式错误';
  }
  clan = clan.trim();
  if (clan.length === 0 || invalidClanChar.test(clan) || clan === '!' || tooLong(clan)) {
    return '输入战队名错误';
  }
  let names = namestr.split('\n');
  for (let name of names) {
    name = name.trim();
    if (name.length === 0 || tooLong(name) || invalidNameChar.test(name)) {
      return `输入名字错误：${name}`;
    }
  }
  if (names.length < 5) {
    return '至少输入5行名字';
  }

  // 名字加上空格前缀，方便战队编组
  names = names.map((name: string) => ` ${name}`);

  return {clan, names, password, create};
}
