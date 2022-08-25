/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";


const inputData = {
  id: "qcCK3SzECmaZAGRrHjaC",
  status: "refused",
  pct: 20,
  amount: 200,
  email: "a@a",
  name: "test2",
  vat: "40",
  fileName: "preview-facture-free-201801-pdf-1.jpg",
  date: "2002-02-02",
  commentAdmin: "pas la bonne facture",
  commentary: "test 15",
  type: "Restaurants et bars",
  fileUrl:
    "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
};

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {
    test("Then build page of create new bill", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      expect(html).toBeDefined();
    });

    test("then I check input form data change", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          email: "jean@neymar",
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const inputBillType = screen.getByTestId("expense-type");
      fireEvent.change(inputBillType, { target: { value: inputData.type } });
      expect(inputBillType.value).toBe(inputData.type);

      const inputBillName = screen.getByTestId("expense-name");
      fireEvent.change(inputBillName, {
        target: { value: inputData.name },
      });
      expect(inputBillName.value).toBe(inputData.name);

      const inputBillDate = screen.getByTestId("datepicker");
      fireEvent.change(inputBillDate, {
        target: { value: inputData.date },
      });
      expect(inputBillDate.value).toBe(inputData.date);

      const inputBillAmount = screen.getByTestId("amount");
      fireEvent.change(inputBillAmount, {
        target: { value: inputData.amount },
      });
      expect(parseFloat(inputBillAmount.value)).toBe(inputData.amount);

      const inputBillVat = screen.getByTestId("vat");
      fireEvent.change(inputBillVat, {
        target: { value: inputData.vat },
      });
      expect(inputBillVat.value).toBe(inputData.vat);

      const inputBillPct = screen.getByTestId("pct");
      fireEvent.change(inputBillPct, {
        target: { value: inputData.pct },
      });
      expect(parseFloat(inputBillPct.value)).toBe(inputData.pct);

      const inputBillCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputBillCommentary, {
        target: { value: inputData.commentary },
      });
      expect(inputBillCommentary.value).toBe(inputData.commentary);

      const btnAddFile = screen.getByTestId("file");
      const someValues = [{ name: "toto.jpg" }];
      const str = JSON.stringify(someValues);
      const blob = new Blob([str]);
      const file = new File([blob], inputData.fileName);

      userEvent.upload(btnAddFile, file);

      let value = document.querySelector('input[data-testid="file"]').files[0]
        .name;
      expect(value).toBe(inputData.fileName);
    });

    test("when input file extension is not png, jpeg or jpg", () => {
      const btnAddFile = screen.getByTestId("file");
      const someValues = [{ name: "toto.test" }];
      const str = JSON.stringify(someValues);
      const blob = new Blob([str]);
      const file = new File([blob], "values.test");

      File.prototype.text = jest.fn().mockResolvedValueOnce(str);
      userEvent.upload(btnAddFile, file);

      let ext = document
        .querySelector('input[data-testid="file"]')
        .files[0].name.split(".")
        .pop();
      let isValideExt = ["png", "jpeg", "jpg"].includes(ext);
      expect(isValideExt).toBe(false);
    });

    test("Then error page should be rendered", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname, data, error) => {
        document.body.innerHTML = ROUTES({ pathname, data, error });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          email: "jean@neymar",
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      let res = mockStore.bills(() => {
        return {
          create : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
        
      newBill.onNavigate(ROUTES_PATH["Bills"], {data: res},"Erreur 404" )
      console.log(screen);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()

    });
  });
});
