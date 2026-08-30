import fs from 'fs';
import path from 'path';
import { parseAndValidateAnyInput } from '../src/lib/validator';
import { calculateStudentResult } from '../src/lib/gpaEngine';

interface StudentData {
  roll: number;
  name: string;
  gender: 'Male' | 'Female';
  class: 'Class 9' | 'Class 10';
  section: 'A' | 'B';
  reg: string;
  ban: number | 'ABS';
  eng: number | 'ABS';
  mat: number | 'ABS';
  phy_th: number | 'ABS';
  phy_pr: number | 'ABS';
  che_th: number | 'ABS';
  che_pr: number | 'ABS';
  bio_th: number | 'ABS';
  bio_pr: number | 'ABS';
  hma_th: number | 'ABS';
  hma_pr: number | 'ABS';
  note: string;
}

const class9Students: StudentData[] = [
  // Class 9 - Section A (15 Students)
  { roll: 101, name: 'Tanvir Hasan', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9101', ban: 88, eng: 84, mat: 95, phy_th: 68, phy_pr: 24, che_th: 66, che_pr: 23, bio_th: 65, bio_pr: 24, hma_th: 70, hma_pr: 25, note: 'Golden A+ Top Performer' },
  { roll: 102, name: 'Sumaiya Akter', gender: 'Female', class: 'Class 9', section: 'A', reg: 'REG2026-9102', ban: 82, eng: 80, mat: 88, phy_th: 62, phy_pr: 22, che_th: 60, che_pr: 22, bio_th: 64, bio_pr: 23, hma_th: 68, hma_pr: 24, note: 'Clean A+ across subjects' },
  { roll: 103, name: 'Nafis Iqbal', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9103', ban: 74, eng: 72, mat: 76, phy_th: 55, phy_pr: 20, che_th: 54, che_pr: 20, bio_th: 56, bio_pr: 21, hma_th: 68, hma_pr: 24, note: 'Grade A boosted by 4th subject' },
  { roll: 104, name: 'Fahmida Sultana', gender: 'Female', class: 'Class 9', section: 'A', reg: 'REG2026-9104', ban: 70, eng: 71, mat: 75, phy_th: 52, phy_pr: 19, che_th: 53, che_pr: 19, bio_th: 55, bio_pr: 20, hma_th: 65, hma_pr: 22, note: 'Solid Grade A' },
  { roll: 105, name: 'Mahir Faisal', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9105', ban: 65, eng: 62, mat: 68, phy_th: 48, phy_pr: 18, che_th: 46, che_pr: 17, bio_th: 49, bio_pr: 18, hma_th: 58, hma_pr: 20, note: 'Grade A-' },
  { roll: 106, name: 'Anika Tabassum', gender: 'Female', class: 'Class 9', section: 'A', reg: 'REG2026-9106', ban: 58, eng: 55, mat: 54, phy_th: 40, phy_pr: 16, che_th: 41, che_pr: 15, bio_th: 42, bio_pr: 16, hma_th: 50, hma_pr: 18, note: 'Grade B' },
  { roll: 107, name: 'Zubair Hossain', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9107', ban: 45, eng: 44, mat: 48, phy_th: 32, phy_pr: 12, che_th: 30, che_pr: 13, bio_th: 33, bio_pr: 12, hma_th: 40, hma_pr: 15, note: 'Grade C' },
  { roll: 108, name: 'Sadia Jahan', gender: 'Female', class: 'Class 9', section: 'A', reg: 'REG2026-9108', ban: 38, eng: 36, mat: 39, phy_th: 26, phy_pr: 9, che_th: 27, che_pr: 8, bio_th: 25, bio_pr: 9, hma_th: 30, hma_pr: 10, note: 'Grade D Boundary Pass' },
  { roll: 109, name: 'Kazi Rayhan', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9109', ban: 85, eng: 80, mat: 92, phy_th: 65, phy_pr: 5, che_th: 62, che_pr: 22, bio_th: 64, bio_pr: 23, hma_th: 68, hma_pr: 24, note: 'Physics Practical Fail (5/25)' },
  { roll: 110, name: 'Tasmia Noor', gender: 'Female', class: 'Class 9', section: 'A', reg: 'REG2026-9110', ban: 82, eng: 78, mat: 85, phy_th: 20, phy_pr: 24, che_th: 58, che_pr: 21, bio_th: 60, bio_pr: 22, hma_th: 65, hma_pr: 23, note: 'Physics Theory Fail (20/75)' },
  { roll: 111, name: 'Shahriar Kabir', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9111', ban: 28, eng: 88, mat: 94, phy_th: 66, phy_pr: 24, che_th: 65, che_pr: 23, bio_th: 68, bio_pr: 24, hma_th: 70, hma_pr: 25, note: 'High Avg Fail (Bangla 28)' },
  { roll: 112, name: 'Mehnaz Parveen', gender: 'Female', class: 'Class 9', section: 'A', reg: 'REG2026-9112', ban: 78, eng: 75, mat: 82, phy_th: 56, phy_pr: 20, che_th: 55, che_pr: 20, bio_th: 58, bio_pr: 21, hma_th: 32, hma_pr: 10, note: '4th Subject GP 2.0 (No bonus)' },
  { roll: 113, name: 'Al-Amin Sheikh', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9113', ban: 'ABS', eng: 72, mat: 78, phy_th: 52, phy_pr: 19, che_th: 50, che_pr: 18, bio_th: 54, bio_pr: 19, hma_th: 60, hma_pr: 21, note: 'Absent in Bangla (Compulsory Fail)' },
  { roll: 114, name: 'Nusrat Jahan', gender: 'Female', class: 'Class 9', section: 'A', reg: 'REG2026-9114', ban: 80, eng: 76, mat: 84, phy_th: 58, phy_pr: 21, che_th: 56, che_pr: 20, bio_th: 60, bio_pr: 22, hma_th: 'ABS', hma_pr: 'ABS', note: 'Absent in 4th Subject (Still Passes)' },
  { roll: 115, name: 'Tahmid Rahman', gender: 'Male', class: 'Class 9', section: 'A', reg: 'REG2026-9115', ban: 79, eng: 79, mat: 79, phy_th: 55, phy_pr: 24, che_th: 55, che_pr: 24, bio_th: 55, bio_pr: 24, hma_th: 62, hma_pr: 22, note: 'Boundary 79 marks tester' },

  // Class 9 - Section B (15 Students)
  { roll: 116, name: 'Samiul Bashar', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9116', ban: 86, eng: 82, mat: 90, phy_th: 64, phy_pr: 23, che_th: 62, che_pr: 22, bio_th: 65, bio_pr: 23, hma_th: 69, hma_pr: 24, note: 'A+ Performer' },
  { roll: 117, name: 'Ishrat Fatima', gender: 'Female', class: 'Class 9', section: 'B', reg: 'REG2026-9117', ban: 75, eng: 74, mat: 80, phy_th: 56, phy_pr: 20, che_th: 55, che_pr: 20, bio_th: 57, bio_pr: 21, hma_th: 66, hma_pr: 23, note: 'Grade A with 4th bonus' },
  { roll: 118, name: 'Rashedul Islam', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9118', ban: 71, eng: 68, mat: 74, phy_th: 50, phy_pr: 19, che_th: 52, che_pr: 18, bio_th: 53, bio_pr: 19, hma_th: 62, hma_pr: 21, note: 'Grade A' },
  { roll: 119, name: 'Lamia Chowdhury', gender: 'Female', class: 'Class 9', section: 'B', reg: 'REG2026-9119', ban: 64, eng: 60, mat: 66, phy_th: 46, phy_pr: 17, che_th: 45, che_pr: 17, bio_th: 48, bio_pr: 18, hma_th: 56, hma_pr: 19, note: 'Grade A-' },
  { roll: 120, name: 'Ashfaq Ahmed', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9120', ban: 55, eng: 52, mat: 58, phy_th: 39, phy_pr: 15, che_th: 38, che_pr: 15, bio_th: 40, bio_pr: 15, hma_th: 48, hma_pr: 17, note: 'Grade B' },
  { roll: 121, name: 'Moumita Sen', gender: 'Female', class: 'Class 9', section: 'B', reg: 'REG2026-9121', ban: 48, eng: 46, mat: 49, phy_th: 33, phy_pr: 13, che_th: 32, che_pr: 12, bio_th: 34, bio_pr: 13, hma_th: 42, hma_pr: 14, note: 'Grade C' },
  { roll: 122, name: 'Habibur Rahman', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9122', ban: 35, eng: 34, mat: 37, phy_th: 26, phy_pr: 8, che_th: 25, che_pr: 9, bio_th: 26, bio_pr: 8, hma_th: 28, hma_pr: 10, note: 'Grade D Minimal Pass' },
  { roll: 123, name: 'Nabila Karim', gender: 'Female', class: 'Class 9', section: 'B', reg: 'REG2026-9123', ban: 80, eng: 76, mat: 84, phy_th: 60, phy_pr: 22, che_th: 58, che_pr: 6, bio_th: 62, bio_pr: 22, hma_th: 64, hma_pr: 23, note: 'Chemistry Practical Fail (6/25)' },
  { roll: 124, name: 'Farhan Tanvir', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9124', ban: 78, eng: 72, mat: 80, phy_th: 58, phy_pr: 21, che_th: 22, che_pr: 24, bio_th: 60, bio_pr: 21, hma_th: 63, hma_pr: 22, note: 'Chemistry Theory Fail (22/75)' },
  { roll: 125, name: 'Jannatul Ferdous', gender: 'Female', class: 'Class 9', section: 'B', reg: 'REG2026-9125', ban: 86, eng: 30, mat: 92, phy_th: 64, phy_pr: 23, che_th: 62, che_pr: 22, bio_th: 65, bio_pr: 23, hma_th: 68, hma_pr: 24, note: 'High Avg Fail (English 30)' },
  { roll: 126, name: 'Kamrul Hasan', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9126', ban: 72, eng: 70, mat: 75, phy_th: 52, phy_pr: 19, che_th: 51, che_pr: 19, bio_th: 54, bio_pr: 20, hma_th: 20, hma_pr: 15, note: '4th Subject Failed (0 bonus, Passes)' },
  { roll: 127, name: 'Tasnim Zerin', gender: 'Female', class: 'Class 9', section: 'B', reg: 'REG2026-9127', ban: 84, eng: 80, mat: 'ABS', phy_th: 60, phy_pr: 22, che_th: 58, che_pr: 21, bio_th: 62, bio_pr: 22, hma_th: 66, hma_pr: 23, note: 'Absent in Math (Compulsory Fail)' },
  { roll: 128, name: 'Sayed Mostafa', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9128', ban: 81, eng: 78, mat: 85, phy_th: 61, phy_pr: 22, che_th: 59, che_pr: 21, bio_th: 63, bio_pr: 22, hma_th: 67, hma_pr: 24, note: 'Clean A+ in all subjects' },
  { roll: 129, name: 'Rezwana Haque', gender: 'Female', class: 'Class 9', section: 'B', reg: 'REG2026-9129', ban: 68, eng: 65, mat: 70, phy_th: 49, phy_pr: 18, che_th: 48, che_pr: 18, bio_th: 50, bio_pr: 19, hma_th: 59, hma_pr: 20, note: 'Grade A-' },
  { roll: 130, name: 'Towhidul Alam', gender: 'Male', class: 'Class 9', section: 'B', reg: 'REG2026-9130', ban: 52, eng: 50, mat: 54, phy_th: 37, phy_pr: 14, che_th: 36, che_pr: 14, bio_th: 38, bio_pr: 15, hma_th: 45, hma_pr: 16, note: 'Grade B' },
];

const class10Students: StudentData[] = [
  // Class 10 - Section A (15 Students)
  { roll: 201, name: 'Abdur Rahim', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1001', ban: 92, eng: 88, mat: 98, phy_th: 72, phy_pr: 25, che_th: 70, che_pr: 25, bio_th: 71, bio_pr: 25, hma_th: 74, hma_pr: 25, note: 'Valedictorian Golden A+ 5.00' },
  { roll: 202, name: 'Nusrat Jahan Shifa', gender: 'Female', class: 'Class 10', section: 'A', reg: 'REG2026-1002', ban: 85, eng: 82, mat: 91, phy_th: 65, phy_pr: 24, che_th: 63, che_pr: 23, bio_th: 66, bio_pr: 24, hma_th: 70, hma_pr: 25, note: 'Golden A+ 5.00' },
  { roll: 203, name: 'Tariqul Islam', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1003', ban: 76, eng: 73, mat: 82, phy_th: 58, phy_pr: 21, che_th: 56, che_pr: 20, bio_th: 59, bio_pr: 21, hma_th: 68, hma_pr: 24, note: 'Grade A+ with 4th bonus boost' },
  { roll: 204, name: 'Marufa Khatun', gender: 'Female', class: 'Class 10', section: 'A', reg: 'REG2026-1004', ban: 72, eng: 70, mat: 78, phy_th: 54, phy_pr: 20, che_th: 53, che_pr: 19, bio_th: 55, bio_pr: 20, hma_th: 64, hma_pr: 22, note: 'Grade A' },
  { roll: 205, name: 'Shakil Mahmud', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1005', ban: 66, eng: 63, mat: 69, phy_th: 49, phy_pr: 18, che_th: 47, che_pr: 18, bio_th: 50, bio_pr: 19, hma_th: 58, hma_pr: 20, note: 'Grade A-' },
  { roll: 206, name: 'Farzana Yesmin', gender: 'Female', class: 'Class 10', section: 'A', reg: 'REG2026-1006', ban: 56, eng: 54, mat: 57, phy_th: 40, phy_pr: 15, che_th: 39, che_pr: 15, bio_th: 41, bio_pr: 16, hma_th: 49, hma_pr: 17, note: 'Grade B' },
  { roll: 207, name: 'Asaduzzaman Nur', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1007', ban: 46, eng: 44, mat: 47, phy_th: 31, phy_pr: 12, che_th: 30, che_pr: 13, bio_th: 32, bio_pr: 12, hma_th: 41, hma_pr: 15, note: 'Grade C' },
  { roll: 208, name: 'Ayesha Siddiqua', gender: 'Female', class: 'Class 10', section: 'A', reg: 'REG2026-1008', ban: 36, eng: 35, mat: 38, phy_th: 25, phy_pr: 9, che_th: 26, che_pr: 8, bio_th: 25, bio_pr: 8, hma_th: 29, hma_pr: 10, note: 'Grade D (Pass boundary 33)' },
  { roll: 209, name: 'Miraz Hossain', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1009', ban: 88, eng: 84, mat: 94, phy_th: 68, phy_pr: 24, che_th: 65, che_pr: 23, bio_th: 66, bio_pr: 4, hma_th: 72, hma_pr: 24, note: 'Biology Practical Fail (4/25)' },
  { roll: 210, name: 'Sumana Chowdhury', gender: 'Female', class: 'Class 10', section: 'A', reg: 'REG2026-1010', ban: 84, eng: 80, mat: 90, phy_th: 62, phy_pr: 22, che_th: 60, che_pr: 22, bio_th: 18, bio_pr: 25, hma_th: 68, hma_pr: 23, note: 'Biology Theory Fail (18/75)' },
  { roll: 211, name: 'Golam Rabbani', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1011', ban: 90, eng: 85, mat: 25, phy_th: 68, phy_pr: 24, che_th: 66, che_pr: 24, bio_th: 68, bio_pr: 24, hma_th: 72, hma_pr: 25, note: 'High Avg Fail (Math 25)' },
  { roll: 212, name: 'Umme Kulsum', gender: 'Female', class: 'Class 10', section: 'A', reg: 'REG2026-1012', ban: 75, eng: 72, mat: 80, phy_th: 55, phy_pr: 20, che_th: 54, che_pr: 20, bio_th: 56, bio_pr: 21, hma_th: 35, hma_pr: 12, note: '4th Subject GP 2.0 (0 bonus)' },
  { roll: 213, name: 'Shourav Das', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1013', ban: 80, eng: 'ABS', mat: 85, phy_th: 60, phy_pr: 22, che_th: 58, che_pr: 21, bio_th: 60, bio_pr: 22, hma_th: 65, hma_pr: 23, note: 'Absent in English (Compulsory Fail)' },
  { roll: 214, name: 'Farhana Akhter', gender: 'Female', class: 'Class 10', section: 'A', reg: 'REG2026-1014', ban: 82, eng: 78, mat: 88, phy_th: 62, phy_pr: 23, che_th: 60, che_pr: 22, bio_th: 64, bio_pr: 23, hma_th: 55, hma_pr: 'ABS', note: 'Absent in 4th Practical (Passes)' },
  { roll: 215, name: 'Zahidul Islam', gender: 'Male', class: 'Class 10', section: 'A', reg: 'REG2026-1015', ban: 80, eng: 80, mat: 80, phy_th: 58, phy_pr: 22, che_th: 58, che_pr: 22, bio_th: 58, bio_pr: 22, hma_th: 68, hma_pr: 24, note: 'Straight 80s Golden A+' },

  // Class 10 - Section B (15 Students)
  { roll: 216, name: 'Tanzeem Ahmed', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1016', ban: 88, eng: 84, mat: 92, phy_th: 66, phy_pr: 24, che_th: 64, che_pr: 23, bio_th: 67, bio_pr: 24, hma_th: 71, hma_pr: 25, note: 'Golden A+ 5.00' },
  { roll: 217, name: 'Sabrina Mostafa', gender: 'Female', class: 'Class 10', section: 'B', reg: 'REG2026-1017', ban: 78, eng: 75, mat: 82, phy_th: 58, phy_pr: 21, che_th: 56, che_pr: 20, bio_th: 59, bio_pr: 21, hma_th: 68, hma_pr: 24, note: 'Grade A with 4th bonus' },
  { roll: 218, name: 'Shahadat Hossain', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1018', ban: 73, eng: 70, mat: 76, phy_th: 52, phy_pr: 20, che_th: 51, che_pr: 19, bio_th: 54, bio_pr: 20, hma_th: 63, hma_pr: 22, note: 'Grade A' },
  { roll: 219, name: 'Nafisa Anjum', gender: 'Female', class: 'Class 10', section: 'B', reg: 'REG2026-1019', ban: 65, eng: 62, mat: 67, phy_th: 47, phy_pr: 18, che_th: 46, che_pr: 17, bio_th: 49, bio_pr: 18, hma_th: 57, hma_pr: 20, note: 'Grade A-' },
  { roll: 220, name: 'Minhajul Abedin', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1020', ban: 57, eng: 53, mat: 56, phy_th: 39, phy_pr: 16, che_th: 38, che_pr: 15, bio_th: 40, bio_pr: 15, hma_th: 48, hma_pr: 17, note: 'Grade B' },
  { roll: 221, name: 'Sharmin Sultana', gender: 'Female', class: 'Class 10', section: 'B', reg: 'REG2026-1021', ban: 47, eng: 45, mat: 48, phy_th: 32, phy_pr: 13, che_th: 31, che_pr: 13, bio_th: 33, bio_pr: 13, hma_th: 42, hma_pr: 15, note: 'Grade C' },
  { roll: 222, name: 'Imtiaz Ahmed', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1022', ban: 36, eng: 34, mat: 37, phy_th: 26, phy_pr: 8, che_th: 25, che_pr: 8, bio_th: 26, bio_pr: 8, hma_th: 28, hma_pr: 9, note: 'Grade D (Pass boundary 33)' },
  { roll: 223, name: 'Dilruba Akter', gender: 'Female', class: 'Class 10', section: 'B', reg: 'REG2026-1023', ban: 82, eng: 78, mat: 86, phy_th: 60, phy_pr: 7, che_th: 58, che_pr: 21, bio_th: 61, bio_pr: 22, hma_th: 65, hma_pr: 23, note: 'Physics Practical Fail (7/25)' },
  { roll: 224, name: 'Nasimul Gani', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1024', ban: 80, eng: 76, mat: 84, phy_th: 58, phy_pr: 21, che_th: 57, che_pr: 20, bio_th: 21, bio_pr: 24, hma_th: 64, hma_pr: 22, note: 'Biology Theory Fail (21/75)' },
  { roll: 225, name: 'Rokeya Begum', gender: 'Female', class: 'Class 10', section: 'B', reg: 'REG2026-1025', ban: 85, eng: 81, mat: 89, phy_th: 22, phy_pr: 24, che_th: 62, che_pr: 22, bio_th: 64, bio_pr: 23, hma_th: 68, hma_pr: 24, note: 'High Avg Fail (Physics Th 22)' },
  { roll: 226, name: 'Juel Rana', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1026', ban: 74, eng: 71, mat: 77, phy_th: 53, phy_pr: 19, che_th: 52, che_pr: 19, bio_th: 55, bio_pr: 20, hma_th: 22, hma_pr: 14, note: '4th Subject Fail (Passes overall)' },
  { roll: 227, name: 'Mst Sabrina', gender: 'Female', class: 'Class 10', section: 'B', reg: 'REG2026-1027', ban: 82, eng: 78, mat: 84, phy_th: 'ABS', phy_pr: 'ABS', che_th: 58, che_pr: 21, bio_th: 60, bio_pr: 22, hma_th: 66, hma_pr: 23, note: 'Absent in Physics (Compulsory Fail)' },
  { roll: 228, name: 'Hasibul Islam', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1028', ban: 86, eng: 82, mat: 90, phy_th: 64, phy_pr: 23, che_th: 63, che_pr: 23, bio_th: 66, bio_pr: 24, hma_th: 70, hma_pr: 25, note: 'Clean Golden A+ 5.00' },
  { roll: 229, name: 'Rabeya Basri', gender: 'Female', class: 'Class 10', section: 'B', reg: 'REG2026-1029', ban: 69, eng: 66, mat: 71, phy_th: 50, phy_pr: 19, che_th: 49, che_pr: 18, bio_th: 52, bio_pr: 19, hma_th: 60, hma_pr: 21, note: 'Grade A-' },
  { roll: 230, name: 'Mainul Hassan', gender: 'Male', class: 'Class 10', section: 'B', reg: 'REG2026-1030', ban: 54, eng: 51, mat: 55, phy_th: 38, phy_pr: 15, che_th: 37, che_pr: 14, bio_th: 39, bio_pr: 15, hma_th: 46, hma_pr: 16, note: 'Grade B' },
];

const allStudents = [...class9Students, ...class10Students];

// Generate CSV
const headers = [
  'roll',
  'name',
  'gender',
  'class',
  'section',
  'reg',
  'ban',
  'eng',
  'mat',
  'phy_th',
  'phy_pr',
  'che_th',
  'che_pr',
  'bio_th',
  'bio_pr',
  'hma_th',
  'hma_pr',
  'test_case_note'
];

const csvRows = [headers.join(',')];

for (const s of allStudents) {
  const row = [
    s.roll,
    `"${s.name}"`,
    s.gender,
    `"${s.class}"`,
    s.section,
    s.reg,
    s.ban,
    s.eng,
    s.mat,
    s.phy_th,
    s.phy_pr,
    s.che_th,
    s.che_pr,
    s.bio_th,
    s.bio_pr,
    s.hma_th,
    s.hma_pr,
    `"${s.note}"`
  ];
  csvRows.push(row.join(','));
}

const csvContent = csvRows.join('\n');

const rootCsvPath = path.resolve(process.cwd(), 'students_60_test_dataset.csv');
const publicCsvPath = path.resolve(process.cwd(), 'public/students_60_test_dataset.csv');

fs.writeFileSync(rootCsvPath, csvContent, 'utf8');
fs.writeFileSync(publicCsvPath, csvContent, 'utf8');

console.log(`Generated CSV files successfully:`);
console.log(` - ${rootCsvPath}`);
console.log(` - ${publicCsvPath}`);
console.log(`Total students: ${allStudents.length} (Class 9: ${class9Students.length}, Class 10: ${class10Students.length})`);

// Validate using validator
const validation = parseAndValidateAnyInput(csvContent);
console.log(`Validation result: ${validation.validRows.length} valid students, ${validation.rejectedRows.length} rejected rows.`);

// Test calculation for all 60 students
const results = validation.validRows.map(s => calculateStudentResult(s));
const passed = results.filter(r => r.isPassed).length;
const failed = results.filter(r => !r.isPassed).length;
const absent = results.filter(r => r.hasAbsent).length;
const boost = results.filter(r => r.hasOptionalBoost).length;
const pracFail = results.filter(r => r.hasPracticalFail).length;
const thFail = results.filter(r => r.hasTheoryFail).length;
const highAvgFail = results.filter(r => r.hasHighAvgCompulsoryFail).length;

console.log(`\nCalculation Statistics for 60-Student Dataset:`);
console.log(`Passed: ${passed} / 60 (${((passed/60)*100).toFixed(1)}%)`);
console.log(`Failed: ${failed} / 60 (${((failed/60)*100).toFixed(1)}%)`);
console.log(`Students with Absent Records: ${absent}`);
console.log(`Students with 4th Optional Boost: ${boost}`);
console.log(`Practical Dual-Pass Failures: ${pracFail}`);
console.log(`Theory Dual-Pass Failures: ${thFail}`);
console.log(`High Average Compulsory Failures: ${highAvgFail}`);
