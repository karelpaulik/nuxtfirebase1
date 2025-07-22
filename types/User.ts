export interface User {
  id: string;
  fName: string;
  lName: string;
  born: string;
  hasDrivingLic: boolean;
  hobbies: string[];
  picked: string;
  createdDate: Date;     // datum
  childrenCount: number; // integer
  userHeight: number;    // float

}