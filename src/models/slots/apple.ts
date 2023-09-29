import SlotBase, {  SlotBaseCreate } from "../slot";

export default class Apple extends SlotBase {
  constructor(props: SlotBaseCreate) {
    super({ ...props, type: "apple", url: "/img/slots/apple.png"  })
    console.log('apple')
  }
}
