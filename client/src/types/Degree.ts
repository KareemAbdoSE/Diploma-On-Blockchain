// src/types/Degree.ts

export interface Degree {
  id: number;
  degreeType: string;
  major: string;
  graduationDate: string; // ISO string
  studentEmail: string;
  status: string;
  university?: {
    name: string;
  };
}