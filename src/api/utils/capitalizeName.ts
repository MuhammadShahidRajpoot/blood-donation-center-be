function CapitalizeName(str: string) {
  if (!str) return null;
  let lower = str?.toLowerCase();
  if (str.split(' ').length > 1) {
    const words = lower.split(' ');

    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0]?.toUpperCase() + words[i].substr(1);
    }
    lower = words.join(' ');
  }

  return str.charAt(0)?.toUpperCase() + lower.slice(1);
}

export { CapitalizeName };
