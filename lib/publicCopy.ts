export function polishDanishProductCopy(value: string) {
  return value
    .replace(/Moses basket/gi, "babylift")
    .replace(/100% linen/gi, "100 % hør")
    .replace(/softened linen/gi, "blødgjort hør")
    .replace(/Baby size/gi, "Babystørrelse")
    .replace(/OekoTex/gi, "OEKO-TEX® STANDARD 100");
}

export function polishDanishGiftboxCopy(value: string) {
  return polishDanishProductCopy(value)
    .replace(
      /En rolig wellness-gave til graviditet, barsel og små pauser\./gi,
      "En gaveæske med pleje og velvære til graviditeten, barslen og den nybagte mor."
    )
    .replace(/rolige? ritualer/gi, "velvære i hverdagen")
    .replace(/små ritualer/gi, "velvære i hverdagen")
    .replace(/føles gennemtænkte og brugbare/gi, "er udvalgt til familiens hverdag")
    .replace(/en gave,? der føles gennemtænkt/gi, "en gave med et personligt præg");
}
