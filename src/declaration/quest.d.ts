interface questData {
  /** Название квеста. Должно быть уникальным для каждого квеста, ибо является ключом */
  name:string;
  /** Описание квеста */
  desc?:string;
  /** Награда за квест */
  rewards?:string[];
  /** Выполнен ли квест */
  complete?:boolean;
}