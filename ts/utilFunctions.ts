class Thread{
  static async Delay(milliseconds: number){
    return new Promise((resolve)=>{
      setTimeout(resolve, milliseconds);
    });
  }
}