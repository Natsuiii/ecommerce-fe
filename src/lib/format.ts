export const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(v)
    .replace(/\s/g, ''); // rapikan spasi di sebagian browser

export const firstImage = (imgs?: string[]) =>
  imgs?.find((u) => !!u && u.startsWith('http')) || '/placeholder.png';
