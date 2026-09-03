import { createCard } from './card'
import { SEVEN_OBJECT_CATALOG } from './catalog'
import type { LegalDeckCard } from './deck'
import { evaluateCard } from './evaluate-card'
import type { CardObject, ObjectId } from './types'

type ThreeObjects = readonly [CardObject, CardObject, CardObject]

interface SevenObjectQuestionSpec {
  readonly id: string
  readonly answer: ObjectId
  readonly objects: ThreeObjects
}

export const SEVEN_OBJECT_QUESTION_SPECS = [
  { id: 'seven-001', answer: 'ghost', objects: [{ objectId: 'ghost', colorId: 'white' }, { objectId: 'pumpkin', colorId: 'blue' }, { objectId: 'wizard-hat', colorId: 'red' }] },
  { id: 'seven-002', answer: 'chair', objects: [{ objectId: 'chair', colorId: 'red' }, { objectId: 'bottle', colorId: 'purple' }, { objectId: 'mouse', colorId: 'yellow' }] },
  { id: 'seven-003', answer: 'bottle', objects: [{ objectId: 'bottle', colorId: 'green' }, { objectId: 'book', colorId: 'white' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'seven-004', answer: 'book', objects: [{ objectId: 'book', colorId: 'blue' }, { objectId: 'chair', colorId: 'gray' }, { objectId: 'wizard-hat', colorId: 'green' }] },
  { id: 'seven-005', answer: 'mouse', objects: [{ objectId: 'mouse', colorId: 'gray' }, { objectId: 'pumpkin', colorId: 'red' }, { objectId: 'ghost', colorId: 'blue' }] },
  { id: 'seven-006', answer: 'ghost', objects: [{ objectId: 'ghost', colorId: 'white' }, { objectId: 'bottle', colorId: 'blue' }, { objectId: 'wizard-hat', colorId: 'red' }] },
  { id: 'seven-007', answer: 'chair', objects: [{ objectId: 'chair', colorId: 'red' }, { objectId: 'book', colorId: 'gray' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'seven-008', answer: 'bottle', objects: [{ objectId: 'bottle', colorId: 'green' }, { objectId: 'ghost', colorId: 'yellow' }, { objectId: 'wizard-hat', colorId: 'blue' }] },
  { id: 'seven-009', answer: 'book', objects: [{ objectId: 'book', colorId: 'blue' }, { objectId: 'chair', colorId: 'purple' }, { objectId: 'pumpkin', colorId: 'gray' }] },
  { id: 'seven-010', answer: 'mouse', objects: [{ objectId: 'mouse', colorId: 'gray' }, { objectId: 'ghost', colorId: 'green' }, { objectId: 'bottle', colorId: 'yellow' }] },
  { id: 'seven-011', answer: 'pumpkin', objects: [{ objectId: 'pumpkin', colorId: 'yellow' }, { objectId: 'chair', colorId: 'blue' }, { objectId: 'wizard-hat', colorId: 'white' }] },
  { id: 'seven-012', answer: 'wizard-hat', objects: [{ objectId: 'wizard-hat', colorId: 'purple' }, { objectId: 'book', colorId: 'green' }, { objectId: 'mouse', colorId: 'red' }] },
  { id: 'seven-013', answer: 'ghost', objects: [{ objectId: 'ghost', colorId: 'white' }, { objectId: 'chair', colorId: 'yellow' }, { objectId: 'bottle', colorId: 'purple' }] },
  { id: 'seven-014', answer: 'chair', objects: [{ objectId: 'chair', colorId: 'red' }, { objectId: 'mouse', colorId: 'blue' }, { objectId: 'pumpkin', colorId: 'green' }] },
  { id: 'seven-015', answer: 'bottle', objects: [{ objectId: 'bottle', colorId: 'green' }, { objectId: 'ghost', colorId: 'red' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'seven-016', answer: 'book', objects: [{ objectId: 'book', colorId: 'blue' }, { objectId: 'mouse', colorId: 'yellow' }, { objectId: 'chair', colorId: 'green' }] },
  { id: 'seven-017', answer: 'mouse', objects: [{ objectId: 'mouse', colorId: 'gray' }, { objectId: 'bottle', colorId: 'white' }, { objectId: 'book', colorId: 'red' }] },
  { id: 'seven-018', answer: 'pumpkin', objects: [{ objectId: 'pumpkin', colorId: 'yellow' }, { objectId: 'chair', colorId: 'green' }, { objectId: 'mouse', colorId: 'blue' }] },
  { id: 'seven-019', answer: 'wizard-hat', objects: [{ objectId: 'wizard-hat', colorId: 'purple' }, { objectId: 'ghost', colorId: 'gray' }, { objectId: 'book', colorId: 'yellow' }] },
  { id: 'seven-020', answer: 'ghost', objects: [{ objectId: 'ghost', colorId: 'white' }, { objectId: 'chair', colorId: 'purple' }, { objectId: 'pumpkin', colorId: 'green' }] },
  { id: 'mixed-021', answer: 'ghost', objects: [{ objectId: 'ghost', colorId: 'white' }, { objectId: 'pumpkin', colorId: 'blue' }, { objectId: 'bottle', colorId: 'purple' }] },
  { id: 'mixed-022', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'green' }, { objectId: 'book', colorId: 'yellow' }, { objectId: 'mouse', colorId: 'purple' }] },
  { id: 'mixed-023', answer: 'chair', objects: [{ objectId: 'chair', colorId: 'red' }, { objectId: 'book', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'blue' }] },
  { id: 'mixed-025', answer: 'pumpkin', objects: [{ objectId: 'ghost', colorId: 'green' }, { objectId: 'chair', colorId: 'gray' }, { objectId: 'book', colorId: 'purple' }] },
  { id: 'mixed-028', answer: 'ghost', objects: [{ objectId: 'ghost', colorId: 'white' }, { objectId: 'book', colorId: 'red' }, { objectId: 'mouse', colorId: 'green' }] },
  { id: 'mixed-029', answer: 'pumpkin', objects: [{ objectId: 'pumpkin', colorId: 'yellow' }, { objectId: 'chair', colorId: 'purple' }, { objectId: 'bottle', colorId: 'red' }] },
  { id: 'mixed-031', answer: 'wizard-hat', objects: [{ objectId: 'wizard-hat', colorId: 'purple' }, { objectId: 'book', colorId: 'yellow' }, { objectId: 'chair', colorId: 'blue' }] },
  { id: 'mixed-033', answer: 'bottle', objects: [{ objectId: 'bottle', colorId: 'green' }, { objectId: 'mouse', colorId: 'red' }, { objectId: 'book', colorId: 'purple' }] },
  { id: 'mixed-037', answer: 'bottle', objects: [{ objectId: 'bottle', colorId: 'green' }, { objectId: 'pumpkin', colorId: 'red' }, { objectId: 'wizard-hat', colorId: 'blue' }] },
  { id: 'mixed-038', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'purple' }, { objectId: 'book', colorId: 'gray' }, { objectId: 'bottle', colorId: 'yellow' }] },
  { id: 'mixed-039', answer: 'mouse', objects: [{ objectId: 'ghost', colorId: 'green' }, { objectId: 'chair', colorId: 'blue' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-040', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'green' }, { objectId: 'book', colorId: 'yellow' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'mixed-041', answer: 'pumpkin', objects: [{ objectId: 'bottle', colorId: 'red' }, { objectId: 'ghost', colorId: 'blue' }, { objectId: 'mouse', colorId: 'purple' }] },
  { id: 'mixed-042', answer: 'wizard-hat', objects: [{ objectId: 'book', colorId: 'white' }, { objectId: 'pumpkin', colorId: 'green' }, { objectId: 'chair', colorId: 'gray' }] },
  { id: 'mixed-049', answer: 'bottle', objects: [{ objectId: 'ghost', colorId: 'red' }, { objectId: 'book', colorId: 'gray' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-050', answer: 'book', objects: [{ objectId: 'ghost', colorId: 'green' }, { objectId: 'chair', colorId: 'gray' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-051', answer: 'mouse', objects: [{ objectId: 'chair', colorId: 'white' }, { objectId: 'pumpkin', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'blue' }] },
  { id: 'mixed-052', answer: 'pumpkin', objects: [{ objectId: 'ghost', colorId: 'green' }, { objectId: 'chair', colorId: 'blue' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'mixed-053', answer: 'bottle', objects: [{ objectId: 'ghost', colorId: 'red' }, { objectId: 'book', colorId: 'gray' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-054', answer: 'chair', objects: [{ objectId: 'ghost', colorId: 'green' }, { objectId: 'book', colorId: 'gray' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-055', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'green' }, { objectId: 'pumpkin', colorId: 'blue' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'mixed-056', answer: 'book', objects: [{ objectId: 'chair', colorId: 'white' }, { objectId: 'pumpkin', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'mixed-057', answer: 'book', objects: [{ objectId: 'ghost', colorId: 'red' }, { objectId: 'mouse', colorId: 'green' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-058', answer: 'chair', objects: [{ objectId: 'ghost', colorId: 'green' }, { objectId: 'mouse', colorId: 'blue' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-060', answer: 'book', objects: [{ objectId: 'chair', colorId: 'white' }, { objectId: 'mouse', colorId: 'green' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-064', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'green' }, { objectId: 'book', colorId: 'gray' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-065', answer: 'chair', objects: [{ objectId: 'ghost', colorId: 'green' }, { objectId: 'book', colorId: 'yellow' }, { objectId: 'mouse', colorId: 'purple' }] },
  { id: 'mixed-066', answer: 'bottle', objects: [{ objectId: 'ghost', colorId: 'red' }, { objectId: 'mouse', colorId: 'blue' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-068', answer: 'book', objects: [{ objectId: 'chair', colorId: 'white' }, { objectId: 'mouse', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-070', answer: 'wizard-hat', objects: [{ objectId: 'ghost', colorId: 'gray' }, { objectId: 'chair', colorId: 'green' }, { objectId: 'book', colorId: 'yellow' }] },
  { id: 'mixed-071', answer: 'pumpkin', objects: [{ objectId: 'ghost', colorId: 'red' }, { objectId: 'mouse', colorId: 'purple' }, { objectId: 'book', colorId: 'green' }] },
  { id: 'mixed-072', answer: 'pumpkin', objects: [{ objectId: 'ghost', colorId: 'blue' }, { objectId: 'bottle', colorId: 'red' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'mixed-073', answer: 'book', objects: [{ objectId: 'ghost', colorId: 'red' }, { objectId: 'mouse', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-074', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'gray' }, { objectId: 'bottle', colorId: 'yellow' }, { objectId: 'book', colorId: 'purple' }] },
  { id: 'mixed-075', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'green' }, { objectId: 'book', colorId: 'purple' }, { objectId: 'mouse', colorId: 'yellow' }] },
  { id: 'mixed-076', answer: 'ghost', objects: [{ objectId: 'chair', colorId: 'blue' }, { objectId: 'mouse', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-077', answer: 'ghost', objects: [{ objectId: 'bottle', colorId: 'gray' }, { objectId: 'book', colorId: 'red' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-078', answer: 'ghost', objects: [{ objectId: 'book', colorId: 'red' }, { objectId: 'mouse', colorId: 'purple' }, { objectId: 'pumpkin', colorId: 'green' }] },
  { id: 'mixed-079', answer: 'chair', objects: [{ objectId: 'ghost', colorId: 'blue' }, { objectId: 'bottle', colorId: 'purple' }, { objectId: 'mouse', colorId: 'yellow' }] },
  { id: 'mixed-080', answer: 'bottle', objects: [{ objectId: 'ghost', colorId: 'gray' }, { objectId: 'book', colorId: 'yellow' }, { objectId: 'wizard-hat', colorId: 'red' }] },
  { id: 'mixed-081', answer: 'chair', objects: [{ objectId: 'book', colorId: 'white' }, { objectId: 'mouse', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-082', answer: 'chair', objects: [{ objectId: 'bottle', colorId: 'white' }, { objectId: 'mouse', colorId: 'purple' }, { objectId: 'pumpkin', colorId: 'blue' }] },
  { id: 'mixed-083', answer: 'chair', objects: [{ objectId: 'ghost', colorId: 'blue' }, { objectId: 'pumpkin', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'mixed-084', answer: 'chair', objects: [{ objectId: 'ghost', colorId: 'gray' }, { objectId: 'book', colorId: 'green' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-085', answer: 'book', objects: [{ objectId: 'bottle', colorId: 'white' }, { objectId: 'mouse', colorId: 'red' }, { objectId: 'pumpkin', colorId: 'purple' }] },
  { id: 'mixed-086', answer: 'book', objects: [{ objectId: 'chair', colorId: 'purple' }, { objectId: 'bottle', colorId: 'white' }, { objectId: 'pumpkin', colorId: 'gray' }] },
  { id: 'mixed-087', answer: 'book', objects: [{ objectId: 'ghost', colorId: 'purple' }, { objectId: 'mouse', colorId: 'red' }, { objectId: 'pumpkin', colorId: 'green' }] },
  { id: 'mixed-088', answer: 'book', objects: [{ objectId: 'ghost', colorId: 'yellow' }, { objectId: 'chair', colorId: 'green' }, { objectId: 'wizard-hat', colorId: 'gray' }] },
  { id: 'mixed-089', answer: 'bottle', objects: [{ objectId: 'chair', colorId: 'yellow' }, { objectId: 'book', colorId: 'purple' }, { objectId: 'mouse', colorId: 'white' }] },
  { id: 'mixed-090', answer: 'bottle', objects: [{ objectId: 'chair', colorId: 'blue' }, { objectId: 'mouse', colorId: 'white' }, { objectId: 'wizard-hat', colorId: 'yellow' }] },
  { id: 'mixed-091', answer: 'pumpkin', objects: [{ objectId: 'chair', colorId: 'gray' }, { objectId: 'bottle', colorId: 'purple' }, { objectId: 'book', colorId: 'white' }] },
  { id: 'mixed-092', answer: 'pumpkin', objects: [{ objectId: 'ghost', colorId: 'blue' }, { objectId: 'bottle', colorId: 'gray' }, { objectId: 'wizard-hat', colorId: 'red' }] },
  { id: 'mixed-094', answer: 'mouse', objects: [{ objectId: 'ghost', colorId: 'purple' }, { objectId: 'bottle', colorId: 'yellow' }, { objectId: 'book', colorId: 'red' }] },
  { id: 'mixed-095', answer: 'mouse', objects: [{ objectId: 'chair', colorId: 'blue' }, { objectId: 'bottle', colorId: 'yellow' }, { objectId: 'wizard-hat', colorId: 'white' }] },
] as const satisfies readonly SevenObjectQuestionSpec[]

function buildQuestion(spec: SevenObjectQuestionSpec): LegalDeckCard {
  const card = createCard(...spec.objects)
  const evaluation = evaluateCard(card, SEVEN_OBJECT_CATALOG)
  if (evaluation.kind === 'invalid' || evaluation.answer !== spec.answer) {
    throw new Error(`Seven-object question ${spec.id} must have one valid answer`)
  }
  return { card, evaluation }
}

export const SEVEN_OBJECT_DECK = SEVEN_OBJECT_QUESTION_SPECS.map(buildQuestion)
