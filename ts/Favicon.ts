class Favicon {
  ID?: string;
  Data?: string;
  Url?: string;
  IsFaviconUrl: boolean;

  CreateID() {
    const randomArray = new Uint32Array(4);
    window.crypto.getRandomValues(randomArray);
    this.ID = this.EncodeBase32(randomArray);
  }

  EncodeBase32(randomArray: Uint32Array): string {
    const encodingTable: string[] = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
      'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
      'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z', '2', '3', '4', '5', '6', '7'
    ];
    let str = "";
    const ra = randomArray;
    const m = 5;
    const n = 32;
    const l = ra.length;
    let i = 0;
    let j = n;
    while (i < l) {
      let a = ra[i] % (2 ** j);
      let b = 0;
      if (j - m < 0) {
        a <<= m - j;
        i++;
        if (i < l) {
          j = j - m + n;
          b = ra[i] >>> j;
        }
      } else {
        j = j - m;
        a >>>= j;
      }
      const val = a + b;
      if (val < 2 ** m) {
        str += encodingTable[val];
      } else {
        throw new Error("Base32 encode error.");
      }
    }
    return str;
  }

  SendJSON = (): boolean => {
    if (this.IsFaviconUrl) {
      const obj = {
        Type: "FaviconUrl",
        Name: this.ID,
        Url: this.Url
      }
      app.Messaging.PostMessage(obj);
      console.log("Sent FaviconUrl", this.Url);
      return true;
    } else {
      const obj = {
        Type: "Favicon",
        Name: this.ID,
        Data: this.Data
      }
      app.Messaging.PostMessage(obj);
      console.log("Sent Favicon");
      return true;
    }
  }

  public toJSON() {
    return this.ID;
  }

  constructor(faviconData: string, isFaviconUrl: boolean = false) {
    this.CreateID();
    this.IsFaviconUrl = isFaviconUrl;
    if (this.IsFaviconUrl) {
      this.Url = faviconData;
    } else {
      this.Data = faviconData;
    }
    this.SendJSON();
  }
}