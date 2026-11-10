import { EXAM_RULES } from '../../data/examRules'
import { FactSections } from '../../shared/components/FactSections'
import { ExportBar } from '../../shared/components/ExportBar'
import { buildSectionsDoc } from '../export/document'
import { useT } from '../../shared/i18n/useT'

export function ExamPage() {
  const { t, loc, lang } = useT()
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">{t('examTitle')}</h1>
      <p className="text-sm text-slate-600">{t('examSource')}</p>
      <ExportBar build={() => buildSectionsDoc(t('examTitle'), EXAM_RULES, { lang, t, loc })} />
      <FactSections sections={EXAM_RULES} />
    </section>
  )
}
