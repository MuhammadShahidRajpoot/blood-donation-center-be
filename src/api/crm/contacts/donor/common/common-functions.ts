export async function findPrimaryContact(contacts: any) {
  let primaryContact: any = null;
  const allCanCall = contacts.filter((pc: any) => pc.canCall === true);
  const WPHN = contacts.find((pc: any) => pc?.code === 'WPHN');
  const CELL = contacts.find((pc: any) => pc?.code === 'CELL');
  const MPHN = contacts.find((pc: any) => pc?.code === 'MPHN');
  const HPHN = contacts.find((pc: any) => pc?.code === 'HPHN');

  if (allCanCall?.length > 1) {
    if (CELL?.canCall) {
      primaryContact = CELL;
    } else if (MPHN?.canCall) {
      primaryContact = MPHN;
    } else if (HPHN?.canCall) {
      primaryContact = HPHN;
    } else if (WPHN?.canCall) {
      primaryContact = WPHN;
    }
  } else {
    primaryContact =
      allCanCall.length > 0 ? allCanCall[0] : CELL ?? MPHN ?? HPHN ?? WPHN;
  }

  return primaryContact;
}
