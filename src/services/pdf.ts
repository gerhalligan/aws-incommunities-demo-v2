import { Question } from '@/types/quiz';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Extend jsPDF type so TypeScript knows about autoTable
 */
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * generatePDF - Creates a PDF that lists all questions and their answers (including child answers).
 *
 * @param questions - Array of Question objects
 * @param answers   - Map of question.id -> Array of answers (with .value, .text, .aiAnalysis, etc.)
 */
export const generatePDF = async (
  questions: Question[],
  answers: Map<number, any[]>
) => {
  // 1) Initialize the PDF
  const doc = new jsPDF();

  // 2) Title Section
  doc.setFontSize(20);
  doc.text('AWS InCommunities Portal - Questionnaire Report', 20, 20);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

  // 3) Prepare array to feed into autoTable
  const tableData: string[][] = [];
  let rowNumber = 1;

  // 4) Loop over each question and gather answers
  questions.forEach((question) => {
    // All answers for this question
    const answerArray = answers.get(question.id) || [];

    // If you only want top-level answers, you might do:
    // const answerArray = (answers.get(question.id) || []).filter(a => !a.parent_repeater_id);

    answerArray.forEach((ansObj) => {
      // We’ll merge everything into a single string for the "Answer" cell.
      let answerText = '';

      // If ansObj is just a string (edge case), use it
      if (typeof ansObj === 'string') {
        answerText = ansObj;
      } else {
        // Otherwise, check .text or .value
        if (ansObj.text) {
          answerText = ansObj.text;
        } else if (ansObj.value) {
          answerText = ansObj.value;
        }
      }

      // Append AI analysis if present
      if (ansObj.aiAnalysis) {
        answerText += `\n\nAI Analysis:\n${ansObj.aiAnalysis}`;
      }

      // Optionally mark child answers
      if (ansObj.parent_repeater_id) {
        // For example, prefix the text to show it's a child answer
        answerText = `[Child of Q#${ansObj.parent_repeater_id}] ${answerText}`;
      }

      // Add a row: [rowNum, questionText, answerText]
      tableData.push([
        rowNumber.toString(),
        question.question,
        answerText
      ]);
      rowNumber++;
    });
  });

  // 5) Create the autoTable with all the rows
  doc.autoTable({
    startY: 40,
    head: [['#', 'Question', 'Answer']],
    body: tableData,
    headStyles: {
      fillColor: [0, 168, 225], // AWS prime blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      // Adjust columns as needed
      0: { cellWidth: 10 },
      1: { cellWidth: 70 },
      2: { cellWidth: 100 },
    },
    theme: 'grid',
    margin: { top: 40 },
  });

  // 6) Save the PDF
  doc.save('aws-incommunities-questionnaire.pdf');
};
