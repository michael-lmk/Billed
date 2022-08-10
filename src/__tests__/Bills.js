/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import ContainerBills from "../containers/Bills";
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import store from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      //to-do write expect expression
      expect(windowIcon.classList).toContain("active-icon");

    })

    test("Then bills should be ordered from earliest to latest", () => { 
      document.body.innerHTML = BillsUI({ data: bills })
      // getAllByText cherche le format 00/00/0000 alors que je le formate à l'affichage de BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
   
      expect(dates).toEqual(datesSorted)
    })

    test("then eye icon is pressed", () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      let container = new ContainerBills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

     
      const iconEye = screen.getAllByTestId('icon-eye')
     
      iconEye.forEach((icon) => {
        const handleShowBill = jest.fn((e) => container.handleClickIconEye(icon))
        icon.addEventListener('click', handleShowBill)
        userEvent.click(icon)
  
        expect(handleShowBill).toHaveBeenCalled()
        // Voir pour vérifier si le modal s'ouvre 

      })

    });

    test("then new bill button is pressed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      let container = new ContainerBills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const btnNewBill = screen.getByTestId('btn-new-bill')

      const handleShowNewBillPage = jest.fn((e) => container.handleClickNewBill())
      btnNewBill.addEventListener('click', handleShowNewBillPage)
      userEvent.click(btnNewBill)

      expect(handleShowNewBillPage).toHaveBeenCalled()
      
    })
    
    test("then we get the defined user data", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      let container = new ContainerBills({
        document, onNavigate, store: store, localStorage: window.localStorage
      })

      let data = await container.getBills()

      expect(data).toBeDefined()

    })
  })
})
// Les option dans le script package.json --noStackTrace --silent 