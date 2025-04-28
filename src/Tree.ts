function toNumber(val: string | number | null): number | null | undefined {
  if (typeof val == 'string') {
    const tmpVal = Number(val)
    if (!isNaN(tmpVal)) return tmpVal
    else return undefined
  } else return val
}
export interface Item {
  id: string | number
  parent: string | number | null
  label?: string
}
export interface ItemNormalized extends Item {
  id: number
  parent: number | null
  label?: string
}

export class TreeNode {
  id: number
  parent: TreeNode | null
  children: TreeNode[] | null
  label?: string

  constructor(
    id: string | number,
    parent: TreeNode | null = null,
    children: TreeNode[] | null = null,
    label: string | undefined = undefined,
  ) {
    const tmpId = toNumber(id)
    if (tmpId) this.id = tmpId
    else throw 'NaN'
    this.parent = parent
    this.children = children ?? []
    this.label = label
  }
  public removeChildren(id: number) {
    console.error('aa')
    if (this.children == null || this.children.length == 0) return
    const index = this.children.findIndex((child) => child.id == id)
    console.error(
      `node ${this.id} deletes ${index} from ${this.children.reduce((sum, val) => (sum += `${val.id}`), '')}`,
    )
    if (index > -1) this.children.splice(index, 1)
  }
}
export class Tree {
  roots: TreeNode[] = []
  private nodeMap = new Map<number, TreeNode>()
  private fakeNodes = new Map<number, TreeNode>()
  private potentialRoots = new Set<number>()
  removeFakeBranches(node: TreeNode, fakeNodes: Map<number, TreeNode>): TreeNode | null {
    if (node.children)
      node.children = node.children
        .map((child: TreeNode) => this.removeFakeBranches(child, fakeNodes))
        .filter((val) => val !== null)
    if (fakeNodes.has(node.id)) {
      if (!(node.children && node.children.length > 0)) {
        fakeNodes.delete(node.id)
        return null
      }
    }
    fakeNodes.delete(node.id)
    return node
  }
  processItem(item: ItemNormalized) {
    let node = this.nodeMap.get(item.id)
    if (!node) {
      try {
        let tmpNode = new TreeNode(item.id, null, [], item.label)
        this.nodeMap.set(tmpNode.id, tmpNode)
        this.potentialRoots.add(tmpNode.id) // Пока считаем корнем
        node = tmpNode
      } catch (e) {
        return
      }
    } else {
      node.label = item.label
    }
    this.fakeNodes.delete(item.id)
    if (node.parent !== null && node.parent.id !== item.parent) {
      const parent = node.parent
      parent.removeChildren(node.id)
      node.parent = null
    }
    if (item.parent !== null && node.parent === null) {
      let parentNode = this.nodeMap.get(item.parent)
      if (!parentNode) {
        parentNode = new TreeNode(item.parent)
        this.nodeMap.set(item.parent, parentNode)
        this.fakeNodes.set(item.parent, parentNode)
        this.potentialRoots.add(item.parent)
      }

      node.parent = parentNode
      if (parentNode.children === null) {
        parentNode.children = []
      }
      if (!parentNode.children.some((child) => child.id === node.id)) parentNode.children.push(node)

      this.potentialRoots.delete(item.id)
    }
  }

  constructor(items: Item[]) {
    for (const item of items) {
      console.warn(item.id)
      const id = toNumber(item.id)
      const parentId = toNumber(item.parent)
      if (id && parentId !== undefined) {
        const itemNormalized: ItemNormalized = {
          id: id,
          parent: parentId,
          label: item.label,
        }
        this.processItem(itemNormalized)
      } else continue
    }
    Array.from(this.potentialRoots)
      .map((id) => this.nodeMap.get(id)!)
      .map((val) => this.removeFakeBranches(val, this.fakeNodes))
      .filter((val) => val !== null)
      .filter((node) => node.parent === null)
  }
  printTree(): void {
    console.log('Tree structure:')
    for (const root of this.roots) {
      this.printNode(root)
    }
  }

  private printNode(node: TreeNode, indent: string = ''): void {
    // Выводим информацию о текущем узле
    console.log(`${indent}- ID: ${node.id} (${typeof node.id})`)
    console.log(`${indent}  Parent: ${node.parent?.id || 'null'}`)
    console.log(`${indent}  Label:`, node.label)

    // Рекурсивно обрабатываем детей
    if (node.children && node.children.length > 0) {
      console.log(`${indent}  Children:`)
      for (const child of node.children) {
        this.printNode(child, indent + '    ')
      }
    } else {
      console.log(`${indent}  Children: []`)
    }
  }
}
