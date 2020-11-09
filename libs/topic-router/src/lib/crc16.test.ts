import {crc16} from "./crc16";

describe('crc16', () => {
  it('calc crc16', () => {
    let max = 0;
    for(let i = 0 ; i < 100 ; i++){
      const r = crc16(i.toString()) & 0x000F;
      if( r > max){
        max = r;
      }
      console.log(r)
      i++;
    }
    console.log(max);
  });
});
