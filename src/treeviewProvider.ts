/*
 * This file contains the TreeViewProvider class, which is responsible for
 * displaying the course, list and problem hierarchy in the sidebar.
 */
import * as vscode from "vscode";
import { JutgeAPI } from "./jutgeApi";
import { components } from "./interfaces/jutge";

export class ExplorerViewItem extends vscode.TreeItem {
  declare id?: string;
  constructor(
    public label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }
}

class ExplorerViewItemBuilder {
  private readonly item: ExplorerViewItem;

  constructor(
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    this.item = new ExplorerViewItem(label, collapsibleState);
  }

  id(id: string | undefined): ExplorerViewItemBuilder {
    this.item.id = id;
    return this;
  }

  contextValue(context: string | undefined): ExplorerViewItemBuilder {
    this.item.contextValue = context;
    return this;
  }

  iconPath(path: string | undefined): ExplorerViewItemBuilder {
    this.item.iconPath = path;
    return this;
  }

  command(comm: vscode.Command | undefined): ExplorerViewItemBuilder {
    this.item.command = comm;
    return this;
  }

  build(): ExplorerViewItem {
    return this.item;
  }
}

export class JutgeTreeViewProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  /*
   * Defines the TreeView data source.
   */
  
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined
  > = new vscode.EventEmitter<vscode.TreeItem | undefined>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> =
    this._onDidChangeTreeData.event;

  constructor(private jutgeApi: JutgeAPI) {
    this.jutgeApi = jutgeApi;
  }

  getTreeItem(
    element: vscode.TreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  // TODO: Refactor into more understandable types.
  getChildren(
    element?: vscode.TreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    
    const courseList = this.jutgeApi.getCourseList();
    
    if (element === undefined) {
      // If element is undefined -> it is initial view, return all user enrolled courses.
      return courseList.then((courses) => {
        const items: vscode.TreeItem[] = [];
        Object.keys(courses).forEach(function (key) {
          if (courses[key] !== undefined) {
            const course: components["schemas"]["CourseBaseOut"] = courses[
              key
            ] as components["schemas"]["CourseBaseOut"];
            const item = new ExplorerViewItemBuilder(
              course.course_nm,
              vscode.TreeItemCollapsibleState.Collapsed
            )
              .id(`course-${key}`)
              .contextValue("course")
              .build();
            items.push(item);
          }
        });
        return items;
      });
    } else if (element.contextValue === "course") {
      // If element context is a course -> return lists for that course. 
      const courseId = element.id?.split("-")[1];
      return this.jutgeApi
        .getListsFromCourse(courseId as string)
        .then((response) => {
          const lists = response.lists;
          const items: vscode.TreeItem[] = [];
          for (const list of lists) {
            const item = new ExplorerViewItemBuilder(
              list.list_nm,
              vscode.TreeItemCollapsibleState.Collapsed
            )
              .id(`list-${list.list_nm}`)
              .contextValue("list")
              .build();
            items.push(item);
          }
          return items;
        });
    } else if (element.contextValue === "list") {
      // If element context is a list -> return problems for that list.
      const listId = element.id?.split("-")[1];
      return this.jutgeApi
        .getProblemsFromList(listId as string)
        .then((response) => {
          return response.items.map((problem) => {
            return new ExplorerViewItemBuilder(
              problem.problem_nm as string,
              vscode.TreeItemCollapsibleState.None
            )
              .id(`problem-${problem.problem_nm}`)
              .contextValue("problem")
              .command({
                command: "jutge.openProblemAndView",
                title: "Open Problem",
                arguments: [problem.problem_nm],
              })
              .build();
          });
        });
    }
  }

  getParent?(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
    throw new Error("Method not implemented.");
  }
}
