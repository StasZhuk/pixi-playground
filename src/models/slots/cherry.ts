import SlotBase, {  SlotBaseCreate } from "../slot";

export default class Cherry extends SlotBase {
  constructor(props: SlotBaseCreate) {
    super({ ...props, type: "cherry", url: "/img/slots/cherry.png"  })
    console.log('cherry')
  }
}
