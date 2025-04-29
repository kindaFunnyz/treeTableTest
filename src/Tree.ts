function toNumber(val: string | number | null): number | null | undefined {
  if (typeof val == 'string') {
    const tmpVal = Number(val);
    if (!isNaN(tmpVal)) return tmpVal;
    else return undefined;
  } else return val;
}
export interface Item {
  id: string | number;
  parent: string | number | null;
  label?: string;
}
export interface ItemNormalized extends Item {
  id: number;
  parent: number | null;
  label?: string;
}

export class TreeNode {
  id: number;
  parent: TreeNode | null;
  children: TreeNode[] | null;
  label?: string;

  constructor(
    id: string | number,
    parent: TreeNode | null = null,
    children: TreeNode[] | null = null,
    label: string | undefined = undefined,
  ) {
    const tmpId = toNumber(id);
    if (tmpId) this.id = tmpId;
    else throw 'NaN';
    this.parent = parent;
    this.children = children ?? [];
    this.label = label;
  }
  public editOwnField(label: string) {
    this.label = label;
  }
  public removeChild(id: number) {
    if (this.children == null || this.children.length == 0) return;
    this.children = this.children.filter((item) => item.id !== id);
    if (this.children.length === 0) this.children = null;
  }
  public addChild(child: TreeNode) {
    if (!this.children) {
      this.children = [];
    }
    if (!this.children.some((n) => n.id === child.id)) {
      this.children.push(child);
    }
  }
}
export class Tree {
  roots: TreeNode[] = [];
  private nodeMap = new Map<number, TreeNode>();
  private fakeNodes = new Map<number, TreeNode>();
  private potentialRoots = new Set<number>();
  isNodeFake(node: TreeNode): boolean {
    if (!this.fakeNodes.has(node.id)) {
      return false;
    }

    if (node.children) {
      for (const child of node.children) {
        if (!this.isNodeFake(child)) {
          return false;
        }
      }
    }

    return true;
  }
  removeNode(nodeId: number): boolean {
    const removeDescendants = (node: TreeNode): void => {
      // Рекурсивно удаляем всех детей
      if (node.children) {
        for (const child of [...node.children]) {
          // Копируем массив для безопасной итерации
          removeDescendants(child);

          // Удаляем из всех хранилищ
          this.nodeMap.delete(child.id);
          this.fakeNodes.delete(child.id);
          this.potentialRoots.delete(child.id);
        }
      }
    };
    const nodeToRemove = this.nodeMap.get(nodeId);
    if (!nodeToRemove) return false;

    // 1. Рекурсивно удаляем всех потомков
    removeDescendants(nodeToRemove);

    // 2. Удаляем у родителя ссылку на этот узел
    if (nodeToRemove.parent) {
      nodeToRemove.parent.removeChild(nodeToRemove.id);
      this.checkAndPruneFakeNodes(nodeToRemove.parent);
    }

    // 3. Удаляем из корней если нужно
    if (nodeToRemove.parent === null) {
      this.roots = this.roots.filter((root) => root.id !== nodeId);
    }

    // 4. Очищаем все хранилища
    this.nodeMap.delete(nodeId);
    this.fakeNodes.delete(nodeId);
    this.potentialRoots.delete(nodeId);

    return true;
  }
  checkAndPruneFakeNodes(node: TreeNode): void {
    let currentNode: TreeNode | null = node;

    while (currentNode) {
      // Проверяем, является ли текущий узел фейковым (включая всех потомков)
      const isFake = this.isNodeFake(currentNode);

      if (!isFake) {
        break; // Нашли нефейковый узел - прекращаем проверку
      }

      // Сохраняем родителя перед удалением
      const parent: TreeNode | null = currentNode.parent;

      // Удаляем узел через метод Tree (рекурсивно удаляет всех потомков)
      this.removeNode(currentNode.id);

      // Переходим к родителю для проверки
      currentNode = parent;
    }
  }
  editNode(item: ItemNormalized): TreeNode | undefined {
    const node = this.nodeMap.get(item.id);
    if (!node) {
      return this.addNode(item);
    }

    // Обновляем label
    if (item.label !== undefined) {
      node.editOwnField(item.label);
    }

    const oldParent = node.parent;
    if (oldParent?.id !== item.parent) {
      // Удаляем из старого родителя
      if (oldParent) {
        oldParent.removeChild(node.id);
        this.checkAndPruneFakeNodes(oldParent);
      }
      if (item.parent !== null) {
        let newParent = this.nodeMap.get(item.parent);

        if (!newParent) {
          // Создаём нового фейкового родителя
          newParent = this.addNode({ id: item.parent, parent: null }, true);
        } else {
          // Защита от циклов
          if (item.parent === item.id) {
            throw new Error(`Node ${item.id} cannot be its own parent`);
          }

          let current = this.nodeMap.get(item.parent);
          while (current) {
            if (current.id === item.id) {
              throw new Error(`Cycle detected: node ${item.id} cannot be assigned under its descendant ${item.parent}`);
            }
            current = current.parent;
          }
        }

        node.parent = newParent ?? null;
        if (newParent) {
          newParent.addChild(node);
          this.roots = this.roots.filter((val) => val.id !== node.id);
        }
        this.potentialRoots.delete(node.id);
      } else {
        node.parent = null;
        this.roots.push(node);
        this.potentialRoots.delete(node.id);
      }
    }
  }
  addNode(val: ItemNormalized, faked: boolean = false): TreeNode | undefined {
    if (this.nodeMap.has(val.id)) {
      return this.editNode(val);
    }
    let parent: TreeNode | null = null;
    // Create parent if needed
    if (val.parent !== null) {
      parent = this.nodeMap.get(val.parent) ?? null;
      if (!parent) {
        // Создаём фейкового родителя, если его нет
        parent = this.addNode({ id: val.parent, parent: null }, true) ?? null;
      }
    }

    const node = new TreeNode(val.id, parent, null, val.label);
    if (parent) {
      parent.addChild(node);
      this.potentialRoots.delete(node.id);
    } // Текущий узел точно не root, у него есть родитель
    else {
      // Нет родителя — это корень
      this.roots.push(node);
      this.potentialRoots.delete(node.id);
    }

    if (faked) this.fakeNodes.set(node.id, node);
    this.nodeMap.set(node.id, node);
    return node;
  }
  removeFakeBranches(node: TreeNode, fakeNodes: Map<number, TreeNode>): TreeNode | null {
    if (node.children)
      node.children = node.children
        .map((child: TreeNode) => this.removeFakeBranches(child, fakeNodes))
        .filter((val) => val !== null);
    if (fakeNodes.has(node.id)) {
      if (!(node.children && node.children.length > 0)) {
        fakeNodes.delete(node.id);
        return null;
      }
    }
    fakeNodes.delete(node.id);
    return node;
  }
  processItem(item: ItemNormalized) {
    let node = this.nodeMap.get(item.id);
    if (!node) {
      try {
        let tmpNode = new TreeNode(item.id, null, [], item.label);
        this.nodeMap.set(tmpNode.id, tmpNode);
        this.potentialRoots.add(tmpNode.id); // Пока считаем корнем
        node = tmpNode;
      } catch (e: unknown) {
        console.log(e);
        return;
      }
    } else {
      node.label = item.label;
    }
    this.fakeNodes.delete(item.id);
    if (node.parent !== null && node.parent.id !== item.parent) {
      const parent = node.parent;
      parent.removeChild(node.id);
      node.parent = null;
    }
    if (item.parent !== null && node.parent === null) {
      let parentNode = this.nodeMap.get(item.parent);
      if (!parentNode) {
        parentNode = new TreeNode(item.parent);
        this.nodeMap.set(item.parent, parentNode);
        this.fakeNodes.set(item.parent, parentNode);
        this.potentialRoots.add(item.parent);
      }

      node.parent = parentNode;
      if (parentNode.children === null) {
        parentNode.children = [];
      }
      if (!parentNode.children.some((child) => child.id === node.id))
        parentNode.children.push(node);

      this.potentialRoots.delete(item.id);
    }
  }

  constructor(items: Item[]) {
    for (const item of items) {
      console.warn(item.id);
      const id = toNumber(item.id);
      const parentId = toNumber(item.parent);
      if (id && parentId !== undefined) {
        const itemNormalized: ItemNormalized = {
          id: id,
          parent: parentId,
          label: item.label,
        };
        this.processItem(itemNormalized);
      } else continue;
    }
    this.roots = Array.from(this.potentialRoots)
      .map((id) => this.nodeMap.get(id)!)
      .map((val) => this.removeFakeBranches(val, this.fakeNodes))
      .filter((val) => val !== null)
      .filter((node) => node.parent === null);
  }
  getAll(): Array<Item> {
    const result: Array<Item> = [];

    const traverse = (node: TreeNode) => {
      result.push({
        id: node.id,
        parent: node.parent?.id ?? null,
        label: node.label,
      });

      if (node.children) {
        node.children.forEach((child) => traverse(child));
      }
    };

    this.roots.forEach((root) => traverse(root));
    return result;
  }
}
