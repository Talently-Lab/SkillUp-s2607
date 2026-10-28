import { useState } from "react";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { ModuleEditor } from "@/modules/teacher/components/ModuleEditor";
import { useCourseSyllabus } from "@/modules/teacher/hooks/useCourseSyllabus";
import { formatSeconds, moduleSeconds } from "@/modules/teacher/utils/syllabus";
import { Loader, PageLoader } from "@/shared/components/Loader";
import AlertIcon from "@/assets/icons/alert-triangle.svg";
import CheckIcon from "@/assets/icons/check.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import "./SyllabusEditor.css";

type SyllabusEditorProps = {
  courseId: string;
};

export function SyllabusEditor({ courseId }: SyllabusEditorProps) {
  const syllabus = useCourseSyllabus(courseId);
  const { modules } = syllabus;
  const [focusModuleId, setFocusModuleId] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  const totalSeconds = modules.reduce(
    (total, module) => total + moduleSeconds(module),
    0,
  );

  const addModule = async () => {
    setIsAddingModule(true);
    const created = await syllabus.addModule();
    setIsAddingModule(false);
    if (created) setFocusModuleId(created.id);
  };

  if (syllabus.isLoading) return <PageLoader label="Cargando temario…" />;

  if (syllabus.hasError)
    return (
      <div className="admin-page__empty" role="alert">
        <MaskIcon src={AlertIcon} className="admin-page__empty-icon" />
        <p className="admin-page__empty-title">No pudimos cargar el temario</p>
        <p className="admin-page__empty-text">
          Revisa tu conexión e inténtalo de nuevo.
        </p>
        <button
          type="button"
          className="admin-button admin-button--secondary"
          onClick={syllabus.reload}
        >
          Reintentar
        </button>
      </div>
    );

  return (
    <div className="syllabus-editor">
      <div className="syllabus-editor__summary">
        <p className="syllabus-editor__totals">
          <strong>{modules.length}</strong> módulos ·{" "}
          <strong>{totalLessons}</strong> lecciones ·{" "}
          <strong>{formatSeconds(totalSeconds)}</strong>
        </p>
        <p className="syllabus-editor__saved" role="status">
          {syllabus.isSaving ? (
            <>
              <Loader size={14} />
              Guardando…
            </>
          ) : (
            <>
              <MaskIcon src={CheckIcon} />
              Guardado automático
            </>
          )}
        </p>
      </div>

      {modules.length === 0 ? (
        <p className="syllabus-editor__empty">
          Este curso aún no tiene módulos. Añade el primero para empezar el
          temario.
        </p>
      ) : (
        <ol className="syllabus-editor__modules">
          {modules.map((module, index) => (
            <ModuleEditor
              key={module.id}
              module={module}
              index={index}
              total={modules.length}
              autoFocusTitle={focusModuleId === module.id}
              onRename={(title) => syllabus.renameModule(module.id, title)}
              onMove={(step) => syllabus.moveModule(module.id, step)}
              onDelete={() => syllabus.deleteModule(module)}
              onLessonRename={(lessonId, title) =>
                syllabus.renameLesson(module.id, lessonId, title)
              }
              onLessonVideoChange={(lessonId, videoUrl) =>
                syllabus.changeLessonVideo(module.id, lessonId, videoUrl)
              }
              onLessonMove={(lessonId, step) =>
                syllabus.moveLesson(module.id, lessonId, step)
              }
              onLessonDelete={syllabus.deleteLesson}
              onLessonAdd={(lesson) => syllabus.addLesson(module.id, lesson)}
            />
          ))}
        </ol>
      )}

      <button
        type="button"
        className="syllabus-editor__add"
        onClick={addModule}
        disabled={isAddingModule}
      >
        {isAddingModule ? <Loader size={16} /> : <MaskIcon src={PlusIcon} />}
        Añadir módulo
      </button>
    </div>
  );
}
