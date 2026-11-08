const soNumeros = (v: string) => v.replace(/\D/g, '');

export function mascaraCpf(v: string) {
  const n = soNumeros(v).slice(0, 11);
  return n
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

export function mascaraTelefone(v: string) {
  const n = soNumeros(v).slice(0, 11);
  if (n.length <= 2) return n.replace(/^(\d*)/, n ? '($1' : '');
  if (n.length <= 6) return n.replace(/^(\d{2})(\d+)/, '($1) $2');
  if (n.length <= 10) return n.replace(/^(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return n.replace(/^(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

export function mascaraData(v: string) {
  const n = soNumeros(v).slice(0, 8);
  return n.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

export function cpfValido(cpf: string) {
  const n = soNumeros(cpf);
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  const digito = (base: string, pesoInicial: number) => {
    const soma = base.split('').reduce((acc, d, i) => acc + Number(d) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(n.slice(0, 9), 10) === Number(n[9]) && digito(n.slice(0, 10), 11) === Number(n[10]);
}

export function dataValida(texto: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return false;
  const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(a, mes - 1, d);
  const existe = data.getFullYear() === a && data.getMonth() === mes - 1 && data.getDate() === d;
  return existe && data <= new Date() && a >= 1990;
}

export const dataParaIso = (texto: string) => texto.split('/').reverse().join('-');
export const emailValido = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const telefoneValido = (v: string) => [10, 11].includes(soNumeros(v).length);
export { soNumeros };