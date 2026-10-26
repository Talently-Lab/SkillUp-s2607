import { useState } from "react";
import { toast } from "sonner";

import { MaskIcon } from "@/modules/admin/components/MaskIcon";
import { ModuleEditor } from "@/modules/teacher/components/ModuleEditor";
import type { EditableModule } from "@/modules/teacher/types";
import {
  formatMinutes,
  insertAt,
  move,
  moduleMinutes,
  newId,
} from "@/modules/teacher/utils/syllabus";
import CheckIcon from "@/assets/icons/check.svg";
import PlusIcon from "@/assets/icons/plus.svg";
import "./SyllabusEditor.css";

type SyllabusEditorProps = {
  modules: EditableModule[];
  onUpdate: (updater: (modules: EditableModule[]) => EditableModule[]) => void;
};

export function SyllabusEditor({ modules, onUpdate }: SyllabusEditorProps) {
  const [focusModuleId, setFocusModuleId] = useState<string | null>(null);
  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  const totalMinutes = modules.reduce(
    (total, module) => total + moduleMinutes(module),
    0,
  );

  const updateModule = (
    moduleId: string,
    patch: (module: EditableModule) => EditableModule,
  ) =>
    onUpdate((current) =>
      current.map((module) =>
        module.id === moduleId ? patch(module) : module,
      ),
    );

  const deleteModule = (index: number) => {
    const removed = modules[index];
    onUpdate((current) => current.filter((module) => module.id !== removed.id));
    toast("Módulo eliminado", {
      description: removed.title,
      action: {
        label: "Deshacer",
        onClick: () => onUpdate((current) => insertAt(current, index, removed)),
      },
    });
  };

  const deleteLesson = (module: EditableModule, lessonIndex: number) => {
    const removed = module.lessons[lessonIndex];
    updateModule(module.id, (current) => ({
      ...current,
      lessons: current.lessons.filter((lesson) => lesson.id !== removed.id),
    }));
    toast("Lección eliminada", {
      description: removed.title,
      action: {
        label: "Deshacer",
        onClick: () =>
          updateModule(module.id, (current) => ({
            ...current,
            lessons: insertAt(current.lessons, lessonIndex, removed),
          })),
      },
    });
  };

  const addModule = () => {
    const id = newId();
    setFocusModuleId(id);
    onUpdate((current) => [
      ...current,
      { id, title: "Nuevo módulo", lessons: [] },
    ]);
  };

  return (
    <div className="syllabus-editor">
      <div className="syllabus-editor__summary">
        <p className="syllabus-editor__totals">
          <strong>{modules.length}</strong> módulos ·{" "}
          <strong>{totalLessons}</strong> lecciones ·{" "}
          <strong>{formatMinutes(totalMinutes)}</strong>
        </p>
        {/* TODO: save each change in the API once the teacher endpoints work */}
        <p className="syllabus-editor__saved">
          <MaskIcon src={CheckIcon} />
          Guardado automático · visible en la página del curso
        </p>
      </div>

      <ol className="syllabus-editor__modules">
        {modules.map((module, index) => (
          <ModuleEditor
            key={module.id}
            module={module}
            index={index}
            total={modules.length}
            autoFocusTitle={focusModuleId === module.id}
            onRename={(title) =>
              updateModule(module.id, (current) => ({ ...current, title }))
            }
            onMove={(step) =>
              onUpdate((current) => move(current, index, index + step))
            }
            onDelete={() => deleteModule(index)}
            onLessonChange={(lessonId, patch) =>
              updateModule(module.id, (current) => ({
                ...current,
                lessons: current.lessons.map((lesson) =>
                  lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
                ),
              }))
            }
            onLessonMove={(lessonIndex, step) =>
              updateModule(module.id, (current) => ({
                ...current,
                lessons: move(current.lessons, lessonIndex, lessonIndex + step),
              }))
            }
            onLessonDelete={(lessonIndex) => deleteLesson(module, lessonIndex)}
            onLessonAdd={(lesson) =>
              updateModule(module.id, (current) => ({
                ...current,
                lessons: [...current.lessons, { ...lesson, id: newId() }],
              }))
            }
          />
        ))}
      </ol>

      <button
        type="button"
        className="syllabus-editor__add"
        onClick={addModule}
      >
        <MaskIcon src={PlusIcon} />
        Añadir módulo
      </button>
    </div>
  );
}
