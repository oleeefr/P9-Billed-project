/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills"

import router from "../app/Router.js";

import mockBills from "../__mocks__/store.js";

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
      expect(windowIcon).toBeDefined()
    })
    
    test("Then bills are displayed on the page", async () => {
      const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
    
        const bills = new Bills({
          document,
          onNavigate,
          store: mockBills,
          localStorage: window.localStorage,
        })
    
        const resultBills = await bills.getBills()
      
        document.body.innerHTML = BillsUI({ data: resultBills })
        expect(resultBills.length).toBe(4)
    })

    test("When I click on eye-icon, modal opens", () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const billsList = new Bills({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage
          })

      const handleClickIconEye = jest.fn(() =>
          billsList.handleClickIconEye(eye)
        );

      $.fn.modal = jest.fn()
      const eye = screen.getAllByTestId("icon-eye")[0]
      eye.addEventListener("click", handleClickIconEye)
      fireEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(document.querySelector(".modal")).toBeTruthy()
    });

    test("the icon button 'Nouvelle note de frais' should be present", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const newBill = screen.getByTestId('btn-new-bill')
      expect(newBill).toBeDefined()
    })

    test("When I click on 'Nouvelle note de frais' button, it should render NewBill page", () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = null

      const billsMock = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = BillsUI({ data: bills })
      const newBill = screen.getByTestId("btn-new-bill")

      const handleClickNewBill = jest.fn((e) =>
        billsMock.handleClickNewBill(e)
      );

      newBill.addEventListener("click", handleClickNewBill)
      fireEvent.click(newBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      const noteDeFrais = screen.getByText("Envoyer une note de frais")
      expect(noteDeFrais).toBeTruthy()    
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })  

})
