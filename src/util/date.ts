export function dateString(
  date: string | number | Date | null | undefined,
  emptyStr: string = "(n/a)"
) {
  if (date) {
    let d: Date;
    if (typeof date == "string") {
      d = new Date(date);
    } else if (typeof date == "number") {
      d = new Date(date);
    } else {
      d = date;
    }
    if (d) {
      return (
        `${d.getFullYear()}` +
        "/" +
        ("00" + (d.getMonth() + 1)).slice(-2) +
        "/" +
        ("00" + d.getDate()).slice(-2) +
        " " +
        ("00" + d.getHours()).slice(-2) +
        ":" +
        ("00" + d.getMinutes()).slice(-2) +
        ":" +
        ("00" + d.getSeconds()).slice(-2)
      );
    }
  }
  return emptyStr;
}

export function dateStringNow() {
  return dateString(Date.now());
}

export function dateTimeNow() {
  return new Date();
}

export function dateTimeToday() {
  const now = dateTimeNow();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
