import axios from "axios";
import { User } from "./interfaces/user";
import { components } from "./interfaces/jutge";

const API_URL = "https://api.jutge.org"; // Subject to change.

export class JutgeAPI {
  /*
   * Quick and dirty API wrapper for Jutge.org (since constant changes are expected).
   * The types are statically generated by openapi-generator-cli and located in the interfaces folder.
   * The API is documented at https://api.jutge.org/docs/
   */

  user: User;

  constructor(username: string, password: string) {
    this.user = {
      username: username,
      password: password,
      token: "",
    };
    this.getAuthToken();
  }

  requestToken = async (): Promise<string> => {
    const options = {
      method: "POST",
      url: `${API_URL}/auth/login`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        username: this.user.username,
        password: this.user.password,
      },
    };

    console.log("Getting token...");
    const response = axios.request(options);
    response.catch((error) => {
      console.log(error);
    });
    const data: components["schemas"]["CredentialsOut"] = await response.then(
      (response) => {
        return response.data;
      }
    );
    return data.access_token;
  };

  getAuthToken = async (): Promise<void> => {
    this.user.token = await this.requestToken();
  };

  getProblemData = async (
    problemId: string,
    preferred_lang = "en"
  ): Promise<components["schemas"]["ProblemOut"]> => {
    const options = {
      method: "GET",
      url: `${API_URL}/my/problems/${problemId}/${problemId}_${preferred_lang}`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.user.token}`,
      },
    };
    const response = axios.request(options);
    response.catch((error) => {
      console.log(error);
    });
    const data: components["schemas"]["ProblemOut"] = await response.then(
      (response) => {
        return response.data;
      }
    );

    return data;
  };

  getProblemStatement = async (
    problemId: string,
    preferred_lang = "en"
  ): Promise<string> => {
    const options = {
      method: "GET",
      url: `${API_URL}/my/problems/${problemId}/${problemId}_${preferred_lang}/html`,
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${this.user.token}`,
      },
    };
    const response = axios.request(options);
    response.catch((error) => {
      console.log(error);
    });
    const data: string = await response.then((response) => {
      return response.data;
    });

    return data;
  };

  getCourseList = async (): Promise<any> => {
    const options = {
      method: "GET",
      url: `${API_URL}/my/courses/enrolled`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.user.token}`,
      },
    };

    if (this.user.token === "") {
      await this.getAuthToken();
    }
    const response = axios.request(options);
    response.catch((error) => {
      console.log("Error getting course list");
      console.log(error);
    });
    const data = await response.then((response) => {
      return response.data;
    });

    return data;
  };

  getListsFromCourse = async (
    courseId: string
  ): Promise<components["schemas"]["CourseDetailOut"]> => {
    const options = {
      method: "GET",
      url: `${API_URL}/my/courses/enrolled/${courseId}`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.user.token}`,
      },
    };

    const response = axios.request(options);
    response.catch((error) => {
      console.log("Error getting lists from course");
      console.log(error);
    });
    const data: components["schemas"]["CourseDetailOut"] = await response.then(
      (response) => {
        return response.data;
      }
    );

    return data;
  };

  getProblemsFromList = async (
    listId: string
  ): Promise<components["schemas"]["ListInfoOut"]> => {
    const options = {
      method: "GET",
      url: `${API_URL}/my/lists/Jutge:${listId}`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.user.token}`,
      },
    };

    const response = axios.request(options);
    response.catch((error) => {
      console.log(error);
    });
    const data: Promise<components["schemas"]["ListInfoOut"]> =
      await response.then((response) => {
        return response.data;
      });

    return data;
  };

  getProblemTestcases = async (
    problemId: string,
    preferred_lang = "en"
  ): Promise<components["schemas"]["Testcase"][]> => {
    const options = {
      method: "GET",
      url: `${API_URL}/my/problems//${problemId}/${problemId}_${preferred_lang}/testcases/sample`,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.user.token}`,
      },
    };
    const response = axios.request(options);
    response.catch((error) => {
      console.log(error);
    });
    const data: components["schemas"]["Testcase"][] = await response.then(
      (response) => {
        return response.data;
      }
    );
    return data;
  };
}