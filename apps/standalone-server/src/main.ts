import {bootstrap} from "./app/boostrap";

console.log("Starting standalone chat server on port 8000");
(async function(){
  try {
    await bootstrap();
  } catch (e) {
    console.error("Server failed with", e)
  }

})();




