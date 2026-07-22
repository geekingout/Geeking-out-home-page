
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// --- Configuration ---
// Explicitly type as string to avoid TS error when comparing with the placeholder string below
const GOOGLE_SHEETS_WEBHOOK_URL: string = "https://script.google.com/macros/s/AKfycbwXWaVr52KdOf0bQHL21kG2vFyNZyOrsYYRv5_Bj1wIMxWx5bs7e9UuqIx7nE6G6qEkjw/exec";

// The original brand mark, vendored here as a data URI instead of being hotlinked from a
// third-party host, so nobody else controls what renders as our logo and it costs no extra request.
// Downscaled from the 1500px source to 192px, which still covers the 56px header box at 3x DPR.
// index.html holds a 64px copy for the favicon — regenerate both if the mark ever changes.
const LOGO_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAAAXNSR0IArs4c6QAAAHhlWElmTU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAMCgAwAEAAAAAQAAAMAAAAAAfrQN/QAAAAlwSFlzAAALEwAACxMBAJqcGAAAQABJREFUeAHtfQm8JkV1b/f33XtnmIV1YGBmYGbYRDFPI4q7gguyiIAymBAliIY8t0SjUZ9PI3n5GRPjexpxe0bUF/Pigg8FXFCRRdxQEI0LomNmgFnYZJs7273f9/X7/8+pU1Vd3X2XmXtn7ly+mrldp875n1NVp051Vy9fd5b1U98DfQ/0PdD3QN8DfQ/0PdD3QN8DfQ/0PdD3QN8DfQ/0PdD3QN8DfQ/0PdD3QN8DfQ/MVg/ks7Vju6pfVy65cN59QyN7z89b+/Ty9t5w6D5Zni8YKLJ5RauYm+f5YFFkrcE8L7Je3s2yfKSV9bblrdZwq8iGizx/aKDVeqidFw8f0j5w07G/vGhkV7W9Xw9Go++E8T3wtSNfP+fuzqZDWu3WSrjs6DzLj8qKYiWct7SV5wcitPfN82w++HPaeSsbyFr4l2ctAOhgTIIMwQ6a/5hQANUrepgTRQ86W2FjOM+K+4G4Oy/yO9pZ9p/Q+003z35XjLZuf+6aD9wDGRX7aQo9oOMxhQZng6mPHn3e0qHewLFFURxfFPkTWlnxaATssoG8tWDQBTf7WSAexYHYxceJwa+BzzDXwG+5XMvKo04bDEwP/COdR5MHHNgdLTo4SLR+j8JaTLafA/ljTJCbhzpDtz3xP//xIdropx33AMfjEZ8+dMx5B+Tb8+MQYCe2iuIZCMjHtFv5/oPYm/cQ2wX/IRjj4BUaGx/s8KLt3ykTPgjBOUkdVo8SbsI4G/FkIc3pgWVSNoAJguDPRjAp0NY7UboFR4rrunn7hgM6I784avXF2wHvp0l4gOPziEz/fPh5h7V6+XMRU6fCAU/D3n0Jly4M9h736Ni7M/gsrC2Q4+CErgR4CGx1J7cTngCsgYEtNWltpTpcC6wuIinnUmswa8tRY6TX6bZa+a9R5zX4++r8zsgPMBkeBqyfxvGAjtg4oNki/sDKVy3uFSMnY6nxEuzXn4k9/L4MKK7FmeIgZMDtzASQQIUNtRkCvHayJBOAOgGnk4LtYarwwWujFh4hhvJ21im6XDmtQY3fyIvii/eP3P+9E9d+epso9zcVDzi3VvizhnFRdsLAwuVLnpnl7ZfhJPO0wby9mHvcrgQ9lzX1wdk0AUrBiQLLtGB7bTrO8yK58hqwEIbADu2J7doEoJ06LJZErt4MS6W2TIZRTAakX7SL/AvdrPWFx9323tvI6KfgAfpzVqa/P3LVgQOdwbNbWft87O2PH8oHEPTYO+IfQ4UBxc4LLXkSWDXyCjbBMDCZYrtjrfE9VuyESaT6oW0S8Gq6bFtaH9UndrQfZptHBUz6DMukYUySq9D/T9x78MJvn3jdRR1iHunJuXX2uOHvlr985UCr90rskc8byNqH8hSWe/uw19TAYiTZXptO0L8oCMGI+SaPef4ypwvE8pKJ0wU2sCnXo/zSZAHGJlfaTquPe3gmLTvbKAc8eGInxSiWy6Q53AlkWO7l2Q+zovexkaH8i4/7j/dtFsOP0I16dRZ0/u8OP/eovJe9DtfbXzbUGti/i6HWKzcaACFQNNgYSeXAVL7nRcFEiefDV3QaraYTwPil3NkJ9Wt7qpjAb8Q6W0SqvraDtOh4ufI5rIoLeOLmtNqCx2T4JU73P4ybEf92zG3v3UT8Iy3RP3t0+u8rz10+t5f9JTryChzq9+VJoF7BsUG3vLy3ZGSw8yHYNGg8z8lZVkkDVnChDqUirLejkrQ+tQ48dt+sS/8CHfDgUegwJb7jUcuOApQbVvgxhjTEXB7xfAE+uxVLo/81tHX+v61ce9Ej6oTZuVR8tUdt3nbYufvNzXuvbeWt1w9lrYNG/UmtDm5TgNienPHBzvOvEeswRDViIQj6hozsOhtxEAY8rSqWARnzKdE/rVtkCi/xySrpgaF6zFVBy6EP1hY7P+E5Au8xdHu9m6Dy7iNvfe+X2a5HQlIP7Vk9zf9m+UvPReC/E9ftH8VLmP7EFv2QwcaGg2zBrgGgPNIMGPefGf4asBDShiJERbBmQ3SxkTyyoRrObiRXnPJJSzvEOniC0yANAR2wqgu54Gr4ZoctBMb6HrdFbUS6iS0eEZhw8+/K0bx30WNu/aefCGMWb+iTPSa9fcWqx7eL1rtxE+hUNpzBz5CpH1jlWyAoJsIiSlK9SuABUNGL6hN8gilPGFeHwwT71brjCRDXGXRc4FKINB5G5aqT4mPdugk1tzXIK2absWf5YGvbyHtXrv3Ag1LpLNw4d87snl245PR5+w/u9aaBLP9r3LFdyHU+Q6gc3DrMwkOvKI+DIMWKXHBlbAg4ILw8sp3a9ZhyfVq34yWYUEcSoMAFWdWeyGgYqWRfygne15nUkbRf7HgsS2qbV404EUaK7i9x3eitR9/6j18V4SzbaI9ncKfevOwlTx5st9+P2/5PlZtX7gE0DjcbHwKGnXA8GdAkIBKsSAVXtkG+t+vkLHvbTk6eYTlR4naoBQ0kC9oS3unapFTrwANkNlN7qu/kLCCZTbOTYuJyjA985UoZG+bGMXoOlkW4s9zr5b3/3SkG3vnoX78HD+bNnmT9nHE9ugh3cLcetuiv8qz9N3h0YT5vYtUFUxwoGh46kBO5qsIRpwP4F+xo+Co/XOqMbRNRCjpvJ/DpULMhOTahDrWm8ogGwyaAykJbgi54FKb2pRzwYkfshXY06Xi+w2tZbRk9rzWAo0Hvl51e9y+Oue1915A/G5Jz5czqyhtWnLliqDf4ISx3TuvywTS5exuCw65esPH6p4GnCMeDoBQ0CVaGF5jUhgROhNW9OxgSmobX4PD2vR3lq02jXR5hSpPHWx6/3XFb00lgNrWlUTt9vdaDSCZ1U0NlYp8bKVuuDG55kowLDtvxK4Z3H7V4wXvyWXA32XVXOzsTtm9afvYpGMyP4i7uclvrs5H6F4LJB5/IkmAjDwrkUq8OS577LxjDlvHgKkwwVLBAI07/wPMYrc/4gIS6GzDESlvMnuDKdtReZAs1pxPAMNQs0WLP2soWUWrlgFWeloVWmEMTrwy2dQ6OBqO9zlfyTv7qo1a/dx3xe2rieM6Y9FeHnf1WOBrXoPPl7kEutI0XOatpstzUhuiDmfJZE3l1/CArS3mQUp0yX/HaUsOQlybri9iomvBwrYN14Z/DKc/VAaTIJA+4oEdTqhjr8VnYuCw0NtbmIMNjJXiUYmtvFE+ftl9YDGbX/urRb3oWre6pyc3z3dv8tyx60cKRvQYvxl3JP8XhFfuY8lOa3P+U9rxoNRvOvVKJL93QfVXdMok66dGAhur4at/V4TBaUjxrKek5jPFVXzGel2Bsz299YPNFT3Cmq7WqvTIt+hQgWb9IKzbRF5smM5SWtaR4k1jJmSfbH3WkgI0uibLhkaz3hj+49X2XGH9PyuP+7ZZ2v2bJGYcOtQc/g/X+s3XJo462AdUGhsEUvh/MhC89CDwuE4KdiI8Q8UHnbTEYAp/16h+4HlO2EWPGWgaZnSZMbIddYLnpJJ4tiPFjLYXMltUf+kGJ9lep0FflaznIaKHMMxl/mENfjvZ6f//Y3yx8Z55dxAPKHpO0Z7upua9fetbj8nbrc7ijewyv8vjBRats0OhclrSsFOm6PXwFK3ZUN0yEyIaYrtqO65Y2iR1tk7Wlzl4IsDCRtPWhzjqM1meWtR7FNbct1iG2Ug8Y0nbJRazlUl9CnaavudarWtqeYMG4ISd6Ls4LthWdf93+8MOvfuKGj28J0plNaczshja+9tAXPwtR/HU47xiu97nOrEuT4Su2XsPWxnEdgsSmXiOsi2Mdo83eRHSJ0VW6aWtufM0DRsrYWB1lrcD3+iSQfLmGVjksil3Dqi3KmFRfefqAScxTvrapvOWydUtvBI9bt88bWrj3pd8/9o37q8WZv90tE+DVy848BXuty7G2OIR7fktNA66uN1TIm/A2kAEZKAuSwFHK+MzTFAeNhkQZYe0wXFkaSlIHNnFddfUFDaUmg0+x1rbSiS5AirPcUHF9lNk/w+HxE0DKuqG8BSfHQ632qfM7rct/dOxfH5z2YyaWd/kE+PNDzzoD69svwBn78s4unZmmpkBSx1c1GvkQlIc21KQ6LDfbq0pU33Rpuy5ZnYpTTD3S7KmlFK9+KMsUE/plOsRa8jwwjKZMaaeLgvk5BLW1XC0ZXo8GKuOW5bojBHk8EmASPGOo07vip0e/calamrnbXToBLjz0zDPxjMn/xZJxgf0Qna7RIa46qZmvg5dq2IClfJZVxm05CQebqkRx5MvQNwBU7jDENuBoTew4jLcr/CAjzpJgEnveBkAVOsLW26cG9UwXZRRsIlRkgtTWBJnp82gQJkM8IXgkGGy1noQl7uXfn+GTYJdNgFctO+PUVpF/Bi7HYw10ZzmZg8vc4OyUz7LqVG1RUscNOnXWgr3x2xICqc6StcvsWGua2hTbMN0yr74+tRdkpGLXmi3Nq/0LctXTdyClyxyxOoZH45YGmvcK8DuD4/bKs8t+dsSbDwqSmUXtkgnwZ8tOfzaWPW7Pb8NGRygdu0TdHXOMpqROwwaWedme4LGps2k8tVnWi2tUuXGqeWqn3lLQ83gA1TY59TS1RCbYKs7klnt7JFzyPJSVZh7bMr5y648IitG9vMM5K82lDMsh3jAbOH5ksHPptSvesK+1aSbl0z4Bzl965uOLvPV5XO3ZN172mBNsUKxsuR2WrRzn6vSYE+gme0RYMAR0REE4ti5qLWGIrk8Bx5aaXcVrOegGqs5WpAPS+k1uSpu2l6mqsI3HgtKmH7fPZGrZJoIdFUwvnC8YvprHGB4J5mSDz5o/J/s/1644f661c6bk0zoB8Bz/Ye289wVcM19sJ7zq8mr3x+JHY1lStEArMX0hDK5nOcIGU4c6lVpw2MA21W7yKr5ZI9QlbXBAa4fwJLSD7aARKMXV11uSOfvUJBn24MG+1h18VdJ308wmg+XppAg6qAMFw1mul0gHXjR3aN+LUZO7axH6szsp/Q3cNLTg9fufsve2ofaX2nn78ekvt+TWirshY7di1CvBN7y5Et80YhMNw1zkzL1KkKpcNcpiakW6jiaSSaQApBjlKEZoZ9S3wemqnrOjBp2SU3A4x5SS0F7siSATKuKD1F6IpttEcuHEZaWDn0wvxhiPufIZ1JZiOubFgW+0yS03Xf5mG69lecLa/b/aveT+G79j8t2dT8sR4KLsotameQMfxW3yp/HxBnWOuSJ0WTm69wlcpUSnqiJCkYnVVKu8V6xKbc8X9ngTwdS3kJrBDiltV9QGMKytJrP6WGYSPjYqr7EhGEUHbFR2ctWnxah+T8Ouqjh509Eg5sdtId/aOPE81dledPAu0/ZFNxz1+j+WhsyAzbRMgN8tventrbx9LoM/TvEgxXzSKotGyQGMX5U4HQgMk9qkRGWg6gxIvRFG0FUr5Hg7tImCla2Oeq0qV2tTfkxXkWrZ6jGslKV+UqEdlAdsquvK1FM1r2vLovgyptkxmdquv/Zv2DSv0+WuEN9DaGESfPTaR73uidKI3bxpOg7ucLNevuSFp+et/DIcpgfodlYQnpvRgzd5snwAoTMw4Yvc6QHj8Y5PDvXEBvMajNWpKG4NV66rZMfZJFjrVG3SZk/5sBFhFGU6ZfuC99iyDGZdPY7fgKMNJrElW0cLXqUqI3/sstpxGM3EttmP5THPg0AkarFI6GiOeZnxOJn4mko8/vKrolec8KzVF9/rQbuBmNJzgHMPO+1wPBv4JQTLPuwoHeVcLV3j4BhPaOdJ5ZnMcqo4bWSCDxyxpxtIRF6PcRa03sSO1mSmrF41Rj39i1HkWFIcS0RwguBVLXi/jv3pS6f4jQHhyfv98TpzIFmWpyjRcGu7WZVKpVCuS9uiqLhFxJfKrj3enidie8ZUHtsQJwtW8pQuA2J5rBfwZa4em5RHXf6mYE5r8MBO1lu+4venXnZddt1YJsvGpriEvfTUpFXHrhrKH9z6cQysPt/DwU1MqyOqfMLMA6lOkBHRoKsiZ6UBY4bkK0NjYDhxcaEiXKvwxn1/qG1BzPbiKy5cIz+EVzHeh6sg9+AIeG/eKx7AO/sfhq2tMClrQXwNZhARPx8q++AVjvvDzkGwfhCOQgfA3l583z8r4cNl/EYBa9ZUboPuXPirCSQRGdK8l5Y9UM35rcO5zsYTwSyopu7MvBqIWB7zU7oJtw2XR3EkOOdZR/3+e9lvsw+meruqbB7b6fr+eMlpfzPYGvjbHtb9YhQbBgrpyvIBPPIptWfktRT4Kh97GVSyjYLZNF2x73pmbdE9rrarCS9Sb09bJntx9ETXtr37EAG34ubezfjB/k/xqSS8dnxgXW9L6/4/n8SjwLxY8JjDNyzM8i6+MzawHN/ROxbNfQJe3/54hNhRCJB59B33mPGVNHbJ2m605NJm7ZvxrUT8WDwnhl1FxpPBZFOR2zkIJzH7hv/D3W5+wnN+98Gbp8L+ZG2YXyarV8Kfs+SUpw+22lejT3KjQ9b10jd1JyshxbwyGQSnA8pt3Zpc9B3O9NWi6pltDprJRcfVSbqEL+GqbTTdNpctsIiT+S7s/hz8q7FnvwY39m557dpP3yVmp2Fz7QkXDfz+jo0r263eU/BWjOejimdjoh2mbbHT1dB3NkH7iByE9sjk2sCxeCV9hcvWdIw12UlhwW766TGNfJ4PbC+6P+48POfEF9y9699UbX6zNk46X3XgqgUDQ1tuwNKner0fHtOA1kFhZfqnrpVglQFTvqICpjQZPE51YzvkSLkBIxPSMGyD4OrscALxSyv8VBL2wXn2KxBfKvLO5XvtN/+nf37zx0cn7aApUPgSHiMoBrc9o10Uq9DqkxE0B3Ea+F/QSe+1IvMDS+YXpU1OhPq4nJf5Aopwoaw4K9flcaCbPF0KWZlYvoBra2/k3c//7UfeYfhdlY/fm3Facs7SU/9+MB/4b/renuB0MYyNDULTnlnkwFWCNA5Y0LZUMnvacJZ0MI1f90sxw2hrHB5M6tgkY/v4G9dO0dsG3lVYx1/y4LYHrrlow5Uz6tdNlz/qgiVZMfTiVi97BU66n8A3uPEHReoJHSz1Dfrn+kiu5ynE41O+Yo0b9JxaKQsoZVtQl0CuEMviCUK+G7ttOKs54Tm//fCNdfrTxUv7MKl6XnroyU/KegPXo+F7UZHG+GfBzoIFpsp0mEzueYJTXdUINjyGtj1O7dTZrmLUYmWCiS1OAJyZIvCxysZ3erPP5b3WR950+7/egupmdPrCsRcN7bXt7lPR/L/EucgJnAh634Ue02TURCYCNTze6Vum3rbS5PM44KltkyHOufPB1y9/uGF0y4mv2IXfNLM+T7pXFx533OADGw+6ut1qP4snaJWghkUxjk2QWeBqUFIuMhCk+acSKyve63tcsJPi644URKf2OSFw3sKT2hFckfn3Xq/3vrfd8dlfShP2oA1PpI878p7T0L+34RXnT+PSSL5yGfVB+s4NknpC/atlYcvGZCm/rhy0xqYsyA0Vl+OJQT7fN7S1O/rGU1d/9AOGn+7cuWXy1Zy95NRX4STxX/TqRAhYW1KI02kWRByAPpjdUCgOCMGVsbGepx3O7KiGVBPqqbEV47m35HX4Iu/hpLb1rrfd/m/fn7wHZpbGTcddOHjXQwPn4UrSO3BEWzHSK9+Fd0Mhflaanle/CVGhVW4y5lVOLK3ScbCbNA168g2HIxnuVBf3djv5k05b8+HbTWc688n2Sdqy6uBTDsRlEV4CPJQMGtE/hmmgZdkBhg9ekVUxIhec6qpG2Y634XHBToyXQK/BmD6vOuDJ1I1w9d/89PbOpy7NLq1GCtq5p6avrnjNwcVAD68nyf8c5whtPVGGQ1wKFLzmCupJBZTkphTlMTZiV8g40E1ogc5ymdYSrxq5E+JPvnD1x15petOZx/2dcD1nLTnlH/ASq7fKNX9YsOCyvSyNGk8qcJj06BBjSNvyJQ7oFCO2sYnrqsVLnaEd3Ovzc0Bo82W4F/nmd95+6ZoJd3gPBF5xxKtPabey9+No8KjtPf0gJH0ZJyvZRKCsCRPrKS7laDkO7BiR8uMJYpdLidE4yEdwY/FZp+2CE2LzQdzWMemXLHv+Ub3ewE1o6N7Yi7qli7qNxkgxLwUoGMZvwohccMQyVe14Gx6nmBhPOj0K8CYWjq3DWPO8/V13fPZDgKTjwQpnXfp3fBh8YXvof+Lc4E/09xjabfVaubvqQ+XFE4KcOnxZe+xSHOxEWsALXaPKE+JtRfeqn6xefBrOcfhQ6bQlWaVMxnq3134r1s97s1N0JzuTdpD2vFwL3FZSjKmzQYUUE+qsmPOMGMPgR/k2XN48GcF/sZj0yNlNnLvmE3efvvojL8Oz+G/E3eVtfFZJfOO9GvqvfPobf9jEf/pYho7EZLeim9iL64pbYLb52DQm7Qv+8IiNJwX59FCTmgBnHXraY7E3ODd+l481yzpl5TSPAzmVWVknkw4Ct7Q5VirbVLy2QzVxfyLrZMW3Rjud5/7dHV/43li2ZrPsRbiqgvf6n4UTzLtkGYjO0kN6T9m8GDygPlSM0XW/9IonSR3d9MuxUJOOMlsQ/3ZAd/k4nc+yt38hWzWlD2zGdZOe1ATodkffnOOhLTqlKUDNneo4DUqBR5uJYAwe2ynR2giDVXIONAb9X7duHTzr3esuXV8BPMIYZ/zuf1+F8XtBJ+v+mksM9WUI8ngy1I9awKa6TeU6F+vY61brLNu1duCeQIarjM9oH7XfyXV2poo34Qlw2iHPezTmy6p07y+dx8aCuq5hxNDj42FELjh1imrUWVQe7ZpNqYOVIOEHF7g7OvrB2+7oXfC+uz/ziP4SujjEbc5Y84n/GO20T8ad45t58y/2nfpS/U7aAlEx5W1ss44uo0OpLuBDvYbTNthRAI18E+911NUzFbwJG87zNr/JO0+bqY2sa4B2iChzJqlyqsNUUUGnCW9LpoC04O/+03vu+OJfzrZLnHE/d5R+Ca6vjw72Th/Juj/iJeE40NMAjZclOgYWnPrrMOLr/mKs0amtseq18eZRAM9mPfvYI9c9a0f7O57ehCbAC5c9h6+4+2Pe9CqnKNDZ6oZkTuCsUI16oHXcAltNjqWhdogglnv+TtH5wHvvuPQt9TX0ufTAS279+Ma8NXIWvgB5iz4GYjur6p4/nRQ6RgE/kXIc7BypJptlnNaBCy64Ud963XSN3IQmAC57vhx7//1DwzU000ZZIKpTNCjrkMFpAaNUajGUU5u+LggokzV/0fn0vDse+6ag1aeaPHDGbZ/cMNLuvARXiFa7K2XixzA2IcjLgamen+g2xEywF9dRtq2Y+IR7O+5o40dFp1521KuwBJ/6NO4EOB3f6EVnX5Hu/a0TbHKg6xuoztLOEdyEN77gS7hQh1Llehj8+FXWNzq91mum+7pxueY9u3TObZ9Yg9vg5+AHN/fJYwgylvV76HQJE8YqjGfMI75Opxzw8bjCDsc8Gndi+es4/Kx0r+29/ILp8Pa4E2AkG3k+fsF6dGh4czO08aFTYyBFpA4L+LrgrrMRHI2DI65t46Tu1k576E/fv+7SrXX4Pq/ZA2ev/tgtOAq8Entd/NaBtzY1oMN4c1T0nwakjpLh0lwD3zTKudoMEybe05cvmZqeYvlOIbTspZ9acf6Uv15x3AmAKXm+3Zs1N2qngyO0mSYNuXbDOhzjyaOVagoOBQIFK5uGllWbdyjh1IcBOu+f13z27qq1PmciHjhn9b9cgaPARfgyZ9gLR763MbDcJkJdzpExXCUHw+/lSaNx4U8140libcelWy5xD8XToqcYb6ryMSfASYtPWokmPo/LnxCMbHI1+Y6AKDuhBu9YXkc0zBnBgdVayhzc3cyKXu9N77/z/91UlvRLk/VAsfqBf8Qd2Ct489DGJd5DlwIXgMmUaae8hy+fbNcFPduvcaTxIOW8ePlk+zUefswJkLV6Z+IFVwtCE9ScOUgbaFWQW59SvCCxSe2m2mJfcDo5TIP6etLb/ewH1l32iVSvX568B87BU7F4j+trR7POuvR8IA5Q+n4yf6qrkWLb1F7c2iYMrlix3md/7sgLj4jxO0s3TgDefMCjbmdbg6TT2DBPk/EEA6EeLahZj4/1DaP1mHODrvCtAlHUdT8e872j2x74q9hWn945D7xk9SfW4aT4r/BgHIfQjx/pukDWMWvepoFuNuNWxtpNeGIow32Lefidw4ti/Z2lGyfADQffcAyW2MelV39YoTbaHMTS2KkOLzrYmGxsC1ZXQMEhb/3I2kun7c0MoaZHFvVHqz9+Kfa2X+BNsjRZAE80T/VZ1vGOt2Fsy3YVY5OCSyj3YZWzpvLOcOMEwI/CT8VduDmhUWwQGstNTVK2w0CeHgVUUqPoWFpPpC+uMueADwAxvNmFxzGu/NCdX/p8s7W+ZGc8MDqQ/bft2ejv+Yg0R2Ssf9EIjYmjDQtmHevyZVKVaU0lHMfdjT1//A/EE1cevv7InelfrNs0AXg97DQ2py5pB1Qa03XYmKdYc6q6jlVot10ZCsTVJbnqUxSbW0Xx33mYrsP0eTvvgfN4f6CXvY87m7pr+WEcNYjHwxBfj9GRj8dfbGMjQc8cuvqnEwgn6Xvh3sDzdr6XaqF2AjznkOcchkZh+WMNDI1gY5qSyqjj8CDKnRtLW62qdrk+tcc3ibWybl5c8qF1l/+8qQ19/hR5oLX1I9uL0d/yyVHea4n/+HvqyfxRtx6Pd6XCPv/xEqz94wUO4UOPd6mpG/MwAc5CL3mA2ulUXejBJN589nR0e2FRefZH6+Ps1Oo9QS1jjtkyojRFeJB4vSDY1qcqzV954cT3/na3eJ9Z6OfT54GXrf6/D3/m8Av+tpdnb9f3DskAs0IMDgeLCxUZNPwqMEdMyq8DJWJwpIZcooRg/Be1AjhctYY2b98guavrNAeM2CLh8XxFK19xIXrOBn/jjJqGL3nUBQteedsnNwl7JzYWcSUTJx783EsGWu0LeAJsAC4/SOtf+P1uyjcMkUbzJ3ZNOPLlMESwo1Uv0gefD21h7f9PH193ef9Bt9JoTW/hIrz0+DGo4oG5+7nAzLKjFy4prs+uyx5z3YGetyo7tvjbqCk4UTWZ5ZF050kYZVjttG0Ju7g5pxx5ypytm0duwRsfHo1fECE4FVIbwBBRWisToxrEY72tLdalsbhstPuN78NFq/f4T9x+5Zq4vX2674Gd8UBlCTQ8PHIEboQcwfU/g5tTTHOjWJ3S5E8k8bimRzjTqNqiHTlwypGwjOMacLTX+X+fvLMf/BPxdx8zcQ9UToLxDnu8b7I1FC3GGq0ZJj3RZXjzj1ujZRIIb/Ib/KAd92eKf5m8Zl+j74GxPVA5AmDd/xT8+straQjrUsZoFbq9uMtsn+0Va4hafcE5I6DTowCWYrwB8uPN6/f6UY3JPqvvgZ3yQDoBcD6e48PWPMNHmoLg5om8LqbMXgh2X4F0IfDjSaDnAb3P9n/eKE7qb6bYA6UJcPzS5+5fdIsjbf1vddmem3t5o1XmgtbHrifkvMH0dybHs+DDvXZ25c7YmMm6xT+dNP++3mZZii5ahJZu7sjB9IE5C/P9UHxwSyfnQ/APzengzT5dkeVDmmfb5uXZQu1dvt3xBh1mwJVH9sqzeVm2daSbI8u2jPTyeVLWPBuZowfvNi54IuWjyPcCAdy29lAuXzxxMrxhTi/YtYt8Dr7/vr3Tw0tCVC9r6XeW5gA70hnMh4ZgolPkyGAKL9Kk7dYA3kEPAnzD44FLrReyQYhG+X2qLv5Y6A7kHWAHiWHZyTo57AAzYDwx2cJXBhTTAY6BjaWz1It7CDnuH+VzYGj79m2/WnDGjf7Ree08FZGecciJx2VF60fYa/PCTbgigwLLU3FFSOyKPV1WSVlq0jrsyg/5ePM0LgP3vv2v6658HoqzKm364DMPbHWKj7Ty4oldXGzDOZJzCAOJ44acTtBhKOV8DJwJOyN1F4umX4MXO5AXGECnKRmil4p6TdvpWzsYANidhTYA6ZSlVtKGNfvMha8Ix1YbrJCtNT2xJUztJwVRfVob5UqxJZpinggJcARyIwUcY0Hjm21Zt9e7fbTXfuHCF173C2JKR4BuLz96ELft0iOAGMPG9u8TPQoEDTaMWq5FYsis0Xo9TTRuxn2diFmXRnqvnrfXwNnbtndxBxRJ9lXIJTLoEfTeuUv6HtPCCNiSPMHRs9693s1m242IgMRKqU4x5XWcHJlcqGOOv5J9QsDQKGeBNDbOhuiJ3PEot06Sj7JPsg52JcwRL3QgsiRZLhVrVVWZYYts3vyB5d2to38EjnyNpjQB0LNj2FYmzblFDS4zgnVqOMusdWjfFZSnJuHFVp2iaF07NdZmlpVutzi0O9rLRjtwrhtEyRxtvErObhgmpo2X5jEmpks4DjASeML2MiNUJhiHE9rEaV6HqeNBz9Xs++Tmvy9rg4AikPWIAoi0Ti9zuLr6qAt/42YyF3mSkgmQHaWhrbVZHQZOc2uT8eVSpyjFkkBP5ijA537Q1LXbW3NvNfuzKcfH9vBtVfiGThMX2c7Eja25Lc2bnJDirEx8TJu+8Sx3ONl7Op4+oWAKNdFgumluKs6mD1bjx3jyLHiR+xgCxh89Eox2yBmzo4PZJNvoNKcMD2HYaQuL5QnQy5braQNFVo2zYsacdW2zZzo0ewCSwkCU6IlOAh5GER8/uXQ2/9CdvuIfE0denaosjr7zpSwdnMwwohPzhOE2Ts/0hbsDvMpkoCGpExvmcUrts8wUt9EwKqluTe5yPxloJpGFvkHgZVG7PK/aBj62ZJX7CXDckuPmYXYczMcfNJkFlhztMq/tkNOX9Wbvtf+eu9bMx8LMobHLxefqejwN5ofABwKdbvg0T2Uss446HGVMJotp4yH362oH9u0QjOtAhBdYXZ0xxqmV6hZFbBIci8Yr120KDmB6UkQFaRvo77oJMHdk7r6ddrG/PrcTG63SXP/Tstou1Sh8a6hvsZgIuIkcBeR99kX2s2rts4RDd+hg1LspuAtyFNxA+slAN3B8DZfmTW5KcVaeJJ5qNs47vFQSI7CTBinLTNY2yx0vPjIR45dKqZ4YEEuwRWeBFp+H6eyPACMDQ/vhpRjuB/AVS6E1vjFKEGkTQqtygARXkqEw1iSgTTz0unmw2/qd6s3CLX/fx8HgnzpR87ir3ocR0yYDWZD7CQEbtZOBuNS+2a3LJ4MnVtqgOespTQYLOuIspXWSn/KsbDoxJqYdThYtro8yGWow2lAICKbPXfITIMu7B2RFG2WGc2gB7e7KxJo1FXfv1c78DQvjzprc3MwOm7vjnB2NA9dkFQdQgISsdjKoVLd1NoznzIxb5zj40t4ZjSpPShdNsQ0LsJQXl9l6w8X9IR3jgJHJQD7xkNUdHTBJ7aJzOAlu9dr7BTQtaIong6/NKnW1a12eCUVHe5YnggxU3VFAFlZoNW6Abfj4DPtItXpkqrYIDbqFf0zmIiu7AbSBrOTUiTFiA8qOV5kMKd7qI78umTzN67DkpTiWyY7aWDo6SEMJwB8xTEanuUpVTjqyaSLJTS9i2tHBT0RZAgWAPwLgF1n7MvjMRm3gx7U4oLWdoljH+NaA0DtFWq/rJoHK8g1S3Wzd0FnxEqipn2FAJjXw5fMGGseI2JjV2XQQw5Sas6P42AhsjDsZEnwp0NkGpjj403ZRHvMivNUtK6Cu3AKnNBwB4LC9xbiwJ76xoLeAN80mvsnLOdHOgnQAmyKb3a88QfDL7wfZ34ZBM5d4X8U4CwQKjY5zrwRC9LhRunJ0cK5XgGJKNp3euDxrX4pnOW4bcBaQ5MuRwWPIYCFKsV1jGy/NTZ7mhovW/4SEI0CW4QQYDXNAba9pEVpDe5YSjToJjtZie3X9xZT4veJm6dZdBnU/ovXuKPnC/GZ57DbymNTpY+fExTakoLzGyWB4y2nDUswzOs2JNZ7pxTyTIZfJ4GUTOG8gdrx+pxiWmVhv+KVvmAB43m6uPBpFBFuk/1Gylpo2aw60tcN6q+UaHc/yBIwEOl4KcRKiCQ9rPbN0a2tRusDcoP3WMtilEzjDNLnD5E059VKZ8MB0g6h7ZTe+yPy6uVYPyg5KM5LGwpmMQKPjnPxSO7Rce95ArKXYhtP37aqTSXB5RJgAaNSgn4lmfAI57flLTxPAE9I0qWwSsN3YM26ZoLk9E1bgfiRvu9shNx0s8ZPrmvm4BuODKfZCimOZKQ4Qw6hEt8JzYGS1R4dYz2jLacVoyyv2Y0aEJ9t0olwnJWTSdrdQ9v0ggRThS32skzUtgcjXI4DTYs36H/aththiRHuxEto+zwTQ0S5zzaYBSbQfHqVzteU53lc/ixPfA0N/0PGyq4366nwvcrLhMJsn5kq/d6bcXG35RHmGZ86UDow1APLKZDB8bCPVj2UTwRNjKdalXVdmZnTt0SHWIzbSFT36u+ufvY2OAAQDIRU4OgSlSayHccBqe6xR1jqt11qjtnUkQYuZILM2EqU1FGjj7E4IaL0KRDeYKyyPRsE8It4wOfJ4z1hyp2Fi98U8o9Pc8OQz2aDogIDhBMhkMggoGcommw7rsxTnTFfrdBopnmzwSj6QpYjV4BttDG2+9cnqg9SfBBMZ8UXR9jo15iJseTKIYrRx+3PHcT1xWWgVxZ4pWDyTJD/wcYqzL+MLnziCcgSIum9uYM7EXb3x3O5B+Maj2AYI9E6fN0id2ET2K4Fpwca6BY8GOLw/MsX6qU2WLRnOysyNZ/kEeJXJQB36hQLzD3n0d6/uCJD3RvkWoErAOgNiy7eMlmpa51lKxPVSI042uersUBuJv+Cb3YkdtT91sBs08M156krnJhSsTIDRzJnIiniVyeAwXk+U3Mb06ngmszzGCE0BErLKUqm2H4qt7SPtUMfqspx8SzHP6CiPdwjcgZQmJXGcBC75IwAct818GmoP42AKlQmS9sIa4nqgffFMmFHa/BLslikM3t7GmZU5L4Py57B0R5zMVZZTZnQpZyFOkUcdLp4MHCZBlGxA38o0ZbTldTyTMWeiUeMJwwmQ6V7ZKgbUcGkuejWbFGflGqivOm0PdLQdQFCmv8EgJSlMgCwb1uA2kebCi44CZWl9yTveeUbbFLfe0Z5VXkaxTryX4oB667OIy/6nSyB2z/xieR3PZMyZGF3G40gbHeXxnrFydPAhoea8PouRjUrAjysDwGE4ykbXTgbWpcGi+Vh10ybTeHhF6ZZN0T/f2zAB8vxhBp7Z9S0VVWpBR/87lNmgRpm2Ulw3abVuUqfn1T0hbQD24FR/VpW7OAloYcnJbuOvFJBxR4NbwpAYz/IKngJL8LfhjE1WzEO5FJBU5TAZhmWj03w8GeVMoseN0hNeKqmGbuO6yYnbaLLx8NjhtOqXQMWDdnYfbMUUaEwCGShUUhvMUrnT8apKsK1MxmbuS8Z0UvdWoiUCma2b0mVQeMJ8gNxPBvY9HmSWI1xJRj5TjBesCVSsAEdHtuTo4Mo2VoIyjKnHuZmu1AmQ6dVhaIMddnpaNwqu4tJkjG3Hdcd0XJfhKXf2Yijb1euFp0H9Y6H4Iv39fBuEBra2n3btz4ywbMloxahmiUYhLque1WBWHCbCSjuKfAk/0h1Qs4ziLFfn6DKINPdM9ANyxodMihRjZeYOL3lMpzIrCwYFXQdLXXVtkLrZhvFs0m7814Svw1R4YLBd+PP1E1NnM+VVbEXtIrYODzaTXwLlRed+XB3qKI8WbfokdLQUYu/Lq3eaDIma4iAxpXZ0gpZt2v0GGXAAJDLybHHe3b4YFtYEi7OI4hHABibulrnG5eITyuGXyp4x1ovpxEYYgwgkGGwMywqMthxwkpJA+COTDqLyjWYeJ7MR55THeJPFekJTgISscamkiNo2l/pBXFynTIiap0G3dbIHhtrZMND7hl2T9SpuqbRKjKrdRCa1sdby1CDKWtukZ7Vx54gX9M7HG+H4Scw1ojrbNhb8zNUhmrOf5lLLHS9ephBTCshYj7Qls5HmlJd4LFhCg2IZ2WTFPJTZ7BKODMPUyep4hrc8xpAWg5pVJgPFcZ2xDcrSRDn/ouSXQAuGtj2IwL8/kUdQJdUGkCAMywmjfPJqaAM6a1YcC8u3QuDDI/+l0oBZwsCnUnAZFNFPR8aTIThSHWwy8o12uV8qGb8GIwNj8jiP6YoeGNIul1Nuf5GexAAhEa9Un+kwN0xMGy/OYzrGCo2Naxdf3iD1A8/c20/1Y1mgZe5CK9wRu3nDzVtg6C6Z6RAQWxegVKpLddiSDRSsHOvX6gHIfvSK/PgYO+todYiOoK3LJWfn8eflNbTJXS6TAXRtMMR2TI88o5tyjwFh7fO8SB88CUbm49pK+pLi6+wbhjL7Ex4rxN945w3UKdmQYymY0QSQUpbdzgpqgxKACl+wTjPJKljqO7zJTMXKbKfR3EGifNyqZU/1b/Ey/KzI+f0pDor9sfM2SBZs8WTwMuDUURE+4kEmfgbecsGbvummucnjPKaJl7JV4PIY42iZjBSjzDb4fsW06TXxyK+T1ekJFhtWlkwGmZCmE3J/BPAnwaiONf7Wrey0GG1ZhyZSps9KQet/tDfIDEEd1XUyD1HCcIrRGqjBtuKkb8Vwb99jQN5iklmVs9PljmuZTlH3IAdhTjLCZLEzjMecKbIhQejK/rwhwYiObcyWlZkbL81LHfANLeHjcxdBVGxEFcUysqN+VNpAeYz31ZNpMj5kr0lMIbDwDJZHlidAnv9a9sBi1CyrJbtS42z5TIK+YRJY63xt0JLGeNNKqJyWtBbBoNTOBwa6RedEqM2+CYCrQH7vRAd4n3jXBp7JJJIh93gQJovUSqTJXe4nA80kspKtWEaDvk7Qscz4goHAZKJAJpLxKCaeCbSfjGbDZIoobyMbpbY4WyWeYUXGikAgI5s+x+LC1+RPgontdrPf4MjMna8ePqEiSiw30MQy0bHEMjVh1ZrDOLxhHVdsWJ2yRiiyU1U2y7b0Mn3AP9ASmI7XuGRI5XVLpeA8sZ84VHk1dctkpK7VYXbS3ORxHtPeBghrn+c5+w5v/a7UbfZiPdL2Z3LLY5zxLDcdl8ubuLn8dKl8BJgzsjYbHbwPpwYHsTbdW1DTJkwznR4hNNib9WRSenNKCA/10hY50s48e/JJi09a+c27v7nGGj0r8k5xC38QNq/tHocwV7ncH6QTvh8KjkqtDMxaPhUizxmd5o12m/XFhNlhFUaXchRKZQdMeVZmBBhteZ3tiMeYqehEunjyBB/t6G3Fi4k/TyhTaQL8ev2P7j/moGesxofyDpIIVIxsxbinzCq5ER0thQgNOlaKsNBjSSdZkAsPmpRymuLrHguydueFIC8marakfQ+/8cr71zz1VXNa2UmjRQGXy/6SSwS6jV8oQS6LFHxZxR2WhY+PTQOAD2vIXoznfLitA4fBk7y5xuQ+RI0ZkpSBgV1cYuYPMkVGO2KIWMgQI5DJqKBePLGq9iDj9zWwS2IdAOFbG6KHr0nwegXao/paJ3f9ouj0sepudYWmvvTN4clE80WGj76UbKN6bZM2UtvbtiUKOoz24hty6InWB7A+6U871KVfeqBlt5/35rbz3tZe7xf7vf0HfkltEantxfaYg57+IXym/rVcoJqQexoGJMv6p5K4XKJRUITq0XhJ7svOpgMrRnmqw4+XwNtZ8YO9N+zzzP53wuiVfppKDzC6SgnhdyN3DvpPRdwfWJnTkHScUpninW6ENV3NI5uRObNFbdJcBsHe8cOLH3hSXGef7ntgKjxQmQD4jtLNOPkcofFSMCJIrZwGctwQLxO8SkzPcFb2WNbVgCcWR4E2Pvn2Z6bfz/semCoPVCbA9gULfoclFd7KbIuYUFXdkUCDOEwOQ0uQ1wQ18UxjTQK1SYSmLr5pg4XjS04++OQVjtXP+h6YEg+UToJpcfXqr29/1OKn/QAT4NF6LsQwDOtyq9WCk6EcJkugbfpw0nAusawhrZK07O0Az3MOqnkeSu2svU83674azLeKqL+Zdg9ceNyFg/Pv+f3jsPfBb0h6eZunnUidAV5PwclrIWeYOqCFfgq1JefzMtY8d897A/jqtOPh9fvyO1DDYHHLmyHyWXa8qURt4hOsiDvYbONLqPq9InwuC2WMPk6leT7b4fns6ODVF9916b1sx86kygSgMTTs2zjBvkCDkByNYvZUA5on567fFDu5kAlN3I5MArElVWjd7pLoK09actKHvrnhm3dqXf3tdHpg7j33vizP25/k/RgOBb4KLNXhM6KuWlykkGt1LKqMF2JIY9QR3rxW5C7CMC6g3+IlGQeVz+5K+DPcNYqgZGJcAQwLFF7SwdeBxTJmyHB3Lr9nt/OpdgJ0Wvn38m5vE5qy0LpqQc622yTQ5riGJ4Hvewn+jkyCUA87qY9G4JLoAZ2i8yYw3kBuP02fB96y6EULt2b52zj+8lRWUpWLYRn1WKTxYlGT5BI4ijZJrEs6LHyDJMbiCiXj7/qPrL10Sl6eHKZYqC9bs/H7d+Bi8c2yFnF8NoKNs8awL3GZMCvHWKOdmaAvaOpoqtOlROtR2x2cC2Af8qqTFp/wWKfWz6bJA5vntl+DHc7R+Nq6jJGOo44Xae7n6/5SXFymJfvT8Q7bwK/WEWwohYXUlH07unYCoG9oWe+rrjofpPS1BarQAFiZ2DjFup52IMPW6So22KXNeBLgJs78Xj7wbrBtJxRX26enwANvWHHmCqy638wdDgNzKv6pHY5r9Y8TqY5f5fIzv72trcHWt6agm2KiaQLwvOfruCO4XRtGF2hz0orjI0GMNVwc5EIThOQy5MG20mnZuQEK1OEVIZwTveh5Bz9vlRjqb6bcA9u7+XtaeXsRrr2Jz+M9PcdgIn+xTlOAq516axoLoS7ayHFOgDbdfOB/Pm71VHW6cQKsvuv5t+KAhWUQ7yezIdXAtEY0TYLQtUSXAiSXJbardRk2PhLgXOm9J6w4YXa/OkW8tGs3rznsjLNxQvrSUXzHO4RfeSQ1FuIxtTGrl9TZCRpVaTpheM7NsZcT5F5+2UXZRYRMSWqcABkqwQWpL7KWcvetrA6wVjRNgqAfOwy06xRtKybY0/oSvE1ACPnWCOwNlufb2+9z6v1sCjzwqqUvXoZD//vlYSHY03EYK+cY2b+xcGUZozcNcqvLgt3HBwQaCVmGSbllNO9eOQVd9SbGmAC88tr7cq/o4ofycQe0Odpga5ram+wkELvSQafvumrOUNdq3YI1OQBcCuEO8Z88d8lzX6na/e3OeGBVtqqNZ8U+hIsMyzp4ui2MQTz2O0/XBjhjAH/yOhwZYx15bu3cgcsfTJrvXLLuiilb/tBfY06A2+/+0RrU+u2mq0HqpKmfBGxYGAC1Xyl7h+X/8zlLnvME6vTTjntg36Xb39LOW2dw6SOBh4hkQEpQwteyc9vB3OzUBbgFuQV6GOf0KCFx8Jkd72G95pgTgCrdIvu0/AJf3BIbiQNTaZOKsxxeOxTkcTnQkKPAMhPR+s8mAktGm1z3GFgX7oO/z+A3A/gNQz/tiAdeueSM03GP9aLmS562J7ZxmVjOoK4L7HgsG5dCPgY0KnBFal13IP/ajvRvLJ1xJ8DInJFv4rD1G151LAdlHJAhKK0y7WQcuEpTnsq8DgTaXeWU61OJ6mp9ROF2OVrWfkyn1f00Tornmq1+PjEPnL/0zMfjAchLsJMbmkiw2vp9InkYKxvzcq7Br6Mcb9N28JF48D736bVffnBivZo4atwJsAGvS0Hof1omAHoUB6V2J+4UpS4Jtow3XSLUOYoPNMpOL5ipwZT0C1wb5g2y9in5tvaHcYVg3D6Z7Ud6fv7BZ67Auv8LcN6BvOKvgaejNN3bUJfFguZ1RwQsy7bhUaFPTcd48RGMcdO8uUvX4jGOV+CRBn1FidyCCvehwtMbZirhJHhOpqBNHS0FHij9bwY9JjACmjwOGK5d/+Ha+Wv2Xrt5zTcCrk/VeeBly19wSLvVvhx718fyKGpJd0ZWmvp8LPu6qyvXyUcfMFmu+PSdV3y4LJma0oQmwKat6x/eb/6yw3Am/iTfSIm/EIRpSFeCPMFb0IduBFvKQ9mxgiRQHhMM6CRotZ962IKV824fXnN1JOqTkQfOX3Hqwa3u0Jdw0vskHj3rUgjU1Od16PF5ekRpxrG+usTfNuJK5Ot+tum3a+vkO8ub8HIBV8Y+hCcyt7BCcQ421il1lnZB6SCzBtafGOt0Mv2g6/TVpNSn9Soj4Kpl7s2wV3vLCYuf9/7+csi8H/Lzlpx+WNEduBI+esoogj/40o0roDGPSxX70/Ge+Nb0mMc2U7pu2UMdvfPb/c7h6590fejB1FITOgKwyoe2rrtv3/lLH4XHYx+nLnINkR1E2EtM5kgQa1m36vRFBnDAk1MuWVmdi+VQq/WUtQtuX37A3vt/a+OmjbP7k6vmvHHyP1l26h9gSfFl/ID9cfGe3wLSfNhkxnATzZvsGF+nkpWinBUgMRZwFfL1F2/6+G3KmfrthI8ArLrTar0Pp0pbXft0VqNgHVHHqFTpILOmp0cC8lP9tCwIqcespDqhrPb0Rhkm6/kLiv2+9PRFz5/dH9sIbmmkzj3ktBfgiXqeGz1mtIdlTxggT8vlbgzQtP9jHRoIvu64PWwar/zgaP7d9es3XdXYqSkQTPgIwLoe3rzunn3nLT0ch6Y/ZLm0D5ZC4NTtyYPUlEscY9K0SzVysMrccimW8uCNde4RrXZx2vJ5K39y++Y168zyIyk/d9npf4HfW12CMdkvPuFt8kHq0SbcjvIZ4E3JZMixBmr91yse/gYuwU9fmtQEYDMOmL8MD8llf4rWzWG55CwpBM6OToJgoVKD1ugA4+KA5loSh/xFuIp1zooFKzetHV7zI1p9JKRVB59y4OP3OeZj6P9bcS9ngDsESxpoZQ/GMgtE401FTptj2eWRh0mu/BS9bx61/iv/47qxVQS/M5tJT4AHtqy/f+95y/bDGvvp2uAkzMWnqWPjstKeAyKxgP54qetbQ1l04+7X41w75+DIdSomwWNXLFj+47XDa6f8pkrckt1Nn4Mlz0C79TkcAZ9rd3jTNo0fkGGFUh2T1Fp9mb6faD1mAQ/jjSAmzr9402/uNN505WnETKiegw9+5oFD3dGf4Dedy9g9BrAZYo69bZXnMCJ3aK/jCLPj+ZEOG1Yr97radGsJ2akdIrh3wXFhPXaG7zrh7md+aiofraX93Z1edNCLFu811H0HhuW/Ys8/IL+ljhpl/olYQpqvUv50l9MjAn6Fxqc+P/X59V+7YLrrpv1JHwGoNDx8x5Z95i0bxqWW08MRKnGteDTh+ZCkFaZE7nRUZtt0aBrKYJcl5ZJJ3YTdG6/9e9Gahbc/bcW8w1fPhnODC487bnBl/od/OjRQ/B+8ReEFuFiBNzmk4RVGy7xredhLp34zxNTmdmSIrTIa0Ob72r3sT34+/NuHYtl00Ts0AdiYIx+9+OfDD+Un4ErL8uDWxHlSTHhJmDZNgrJWMlESG14KpViPx6Zq4jNNbDHPDVpHYPPyFQsOX3nkgpWr1wyv2enXbFTrm3ZOfvbSU1+4ZdOCT+A9ma9Hv/bTHzJqvToFyn5QXn27xpLVa0ye21QH7uRjAvTe8bkNX5vWKz9xi8ueiSUToJcd8MTjW+2B6xFLc80QgzHQCEgUjEO+/ikiLitHK52IDpFWl+lK2RWMF+OUrrbHnXRtwmtb/x1fy/zotfdc+zNiZ3JadeyxQ90HVpyMl+L+JV7/+hx+U82WO3Hf2Qf6sy7ZuNTJyGtQa4KPyW8KelPSy57dGxcMbj3h02uv22b86c53uo/LDnwyfz/6Nr7gNxhT17Isf9iYsz3PoeMyaUs2aBLUYJqsqUw9taVInURmTaUqL9uK9XDCyPMwSt0AABGRSURBVCDahoj5WqvIPrltYPM1P1j3g62xld1NvxjP8GSj+VnoxSvQzifyRk6X19STZP4ydlr2/CaBAZDb2EWsCZM80o6fpIZt+PHtiZ9f//Ufjo+fOsQEuj92ZYsWPX3h3LxzA2Yw3iAWLzrUbaxA/lxN5BqPluOyShRvtWogm8TZcjZUX20EWjXFrq/TrI2BdRCq8IggA1cUv8QvpC7L8s7lxcbiZ9dl1/GHsrs8rTr8efuMjAw8HesDvAggPwUTdTHbp5+Y0ea4riZtK3PLpTJ0LFkZGUq2kzJOzTw0UWPO6cET307Wec9l6696eyNwmgQ70u9KU5Yc+ORnYP15NcZkDg3GRksB7gQxj8aaylaRTQLFqn3qxGWljZtgAI3bVIet4/GwzH94GIuB/3PY+Bb2ute0usVPv33Pt++mznQk/jxx9NDhFZ1O9yl4Vv8kvCnw2XhNyXK+V41Bb3vV0FttRbWPTa1LkfX6TdpTxWfwu6PuTfO73RM+c/c3N0+V7YnaqffERLUj3LJFx7+LvyrSpVB5aFhiRVaZBbQviyzoKDaUWY3tbSq2nG3BODuBJsV6tSatV3klvmNZvSpTpvG4xuZkkADMs3vB/xVOpW8G96dZ0b2tPdheN9oevf+6ya1f81P2P2Vha3B0UYaLCXgT5rGwy593Ph6n6kcjOOaz9fKIAsLeEttkKabJs742ycfjqzy1alpTlWtfXFuHO0V+4hUbv3bTVFmfjJ0p6+mR2Slzth50/9cQJM8ZaxKwcazUJoEvC1+bI/KkTByT6VnDFVvWE1wUCgELl7uC8QyrObeufdJKpY2nOYcNYQ9DnBRyPUmfp38QnHsxtPeAey9OTB/AWzUeBo/nEPLMMb6TMgh6PtT3AeYA0AciPwiYRfibxyOOs4hwD3dtgRM+cyZglXDbcqmMrcObcqpnfMvHkxtuonmYwqrBpWa313nDlzd+458namOqcVPax0MPetoRRdG9AQN0CAODAxVXYCXy5M8JDWfYprJ13iYBy2ZLaavB+Gox2CXf8ZAZ39s1mbNrNjVXlOl4Ow7LyUCZ5kFqeNUu25CAkIVzOTRMm2jTl9wKET9ggjBQlGqq41Gi/CapU/a4UJ4oVe5Z0NIrb91LH7/hKX+0O29Gjt/z0OYJUUsWP+V0vCD4Mhy4+TJfOLjs4rgsctcC8hWv1ViZJeWbppMnejEu0A4btcGpSW2yAwfEeIrWNhsv5EqFctU2OanNuNWma/VoTWYn5sZ00ApUqMeQsYy8uN4mzHh8k6d5ne0YY+coMS+meaTDUvLWkV7r2V+/6+u79d7LDt8IizsU05s2r/vN3vMOwYN87RN5FAgpdVsyZFJMeDWhSXslVK1eBeWaUdJ0rQPPsWOptjzmOBMGtqLPE6wrxh6wihKkWIivn3mTFSJolu0CGETOXkU59DcR0VbFXoKJi4ZvymNsSjMK8Fa/h/BZgBd/9a6r8GH23ZumfAKwO5u2PP17C+Y/cBTuEv9B2bU7MgloMRldlEscX/AElZDS8jg8B4+1NDBijhhusB3slwIqUY9tJiIxHstjOzGtrQjaVZnzfIBEtlU73dKG2kmUUuBOlHH2hJ849v7sK3d9Y5fd7R2rudMyAXCBpBgYOvjqgXb2bFzdONTcqg1JgjcNUu97JXwxxblykMO6FEoc1/dJ8hw81rLAqAaaooxvufXVNUAykcVGwVW8MhNRpFovKddVtmXKKYb8unYY3uR1ejFmR2g+6oDvvPztVzd+c8Z88rbeszvSuxqdQw552vJWp3s1FsZHYtEn8ckKbQpY5XHZ80CQ78uJXuAHDJsQ1uCK4LYOG/NEL8EJz4EMSx6T1Wj8kCsVyoqv1TGQ2GvGBUmgrH7jRKaElZbJTHWadI2f5ubXlD9e2W6O4Q0UvJ9yydc2fPNC6JQvcY1nZBrl03QE0BYPD9/50ML5h3wX7j8TV0cWVPuRDksydFJMeGIk5Wm5xPUFT4im7tnKPG3XGDwnqiKqnNhW/V5UdWKZ0ImptJ2JWKtx2xQb2zZgHY8y8lN904lzw002pw254pN1v/Jga9MF6x5eN6N+nz2tE4Cd37Rlw13z5x16E8778fxKVvPmtuokKA22L3iCZpHSsvJKXF/wRKQVeGJONnU8tRuLq6gqZ3ybkd0Aru8W5GmQjlUjzdWdVKuNuLJAjyULqMlTermzd0N7cMtLr7nz+5smb2F6NaZ9ArD5w1vWrZ0/b+nPcfXrDIzwULVLOpw2qHWDp5FriNhCyivbEqSH4ApErFoWRjKvkKAdv5x5jLW7WgchqlQvq5cLtqEpaqcsLJd8s0pEnZ4BmttmiMnlcqOr6N7U6fbO+saG6++bnPauQe+SCcCuDG9Z/9sF85feikU6fkSTDWoopkNWPRqU3ODhnnDitEy28koSX/BEZH6ivGDbDid1mla/VVAOLtUo8wwZ2Y9ZoAVfX5lDVoVVTmI0KbIObddkNcuGeK0fP8C/ZbQ1eua1d127sSydOaVdNgHY5eHN63+9kJMgy0/DH44EdHXq6HEmAQ2JSqqnAh080pZSe+A36lMnHCXMVhoQKV/KrjnVVlU51jLNVW42yavS9TbielM9tW226vXruaa547lb9tw80Bo44+r1V8/oN3Hs0glAl3ISLJi39D9wVeFUBBvOCTiM6VBoucwtl4JKwpdxK/M0oMoTIQRPGSvqNTbIMjsBE1POTmQuIh1QOWpHWTFd9UMVk7ahrO/amFScYqzV5Kf2TLajOYMfd3m/1xptnXXV3Vdt2FE7u0pvl08AdozLofnzlvwQv/5/AW6MLLRhqAZAOWirchiTwU5GXLzXzIslEgCNNmgoRotht6nnlwLKQeqRVa7qqvmSnbha0DGOohSbyg0j/Gq1ol+nQ73JJLfnv6poFed86+5v3TMZ3d2F3S0TgJ0d3rLh9n3mL/k2rhOfiNeVLArPj6QjpOUyt1wKMZrwxavNvFgSgiPmxsMyNr8+gFQn2K6fTqrbZF/bMBFM3NomvPJjZKC9bOymBIWI0uDv/ttAr33e1RuvfigSzWhyt00AeoWXSPeec/AVvbx1HCbBctuX1YfJRI8GtFw3gs28WILnVFzyhDHG4VPcpBPJIkhEOtvmAZX4gPTSQKgsWKjD1vFowa5WBWuBoo79BW4zJaOCE178TOcfFm3c/y+u3Hzl9mb0zJMED+7Gtu2//5P3HmoXF2M5dB5vElqj6NxAM7y0ZDw2OcUID4AUS506ntnQnFuXxEazDlHj2VOM2kvbLLKIGZGq4LdWS50dD/JEGV3V8UAQzXXGqNDPMhd83h4uss34cvsbr994zb+k8j2hvFuPAOagrVvXb8d5weXz9zoEbwNoPRuejdpVN0zpMNdgPMsTsmfTOgPP2hDzY6nsRcHQvWm4QlSnZzzFWim2ZjzNzSZLVo8hmrWCpFxPbNOsxLygZ9I6fZPFOXHpn7zCpCj+E8/2/NENd117WYzfk+go0HZ/szdv3fDdBfOX3YzLCM/EkmgfCzttWTqAWi5zQ8kPrmd5IupoHY9i5VeknuGJyJa1dvKyYCTSjcjQooA0SvtZBvu+Gwh5HY9i8utsUFaXWJML/q8VrXzVdzde87M63J7Cm1ETgE6TK0QLl16OUTkKS6Kjyo4sD7TK0qMBuTU4z6rbi3thuboJToT64FKbdbI44GJ5lY7aVU8m7Q3FuA7jxvaNZzllY8mJw06JmxFc5vy7rUsffO2Nv/neA6a/p+aRW2daF04YWHzA1jfD5+9AiOPH4eVzA7aWjbcOcBoYbT0xTgnnQLUyZ8HshFwpK5t95vaUZGzP5IY3meCd0GTKC6VAhb4Fe7E01B3bNex4edymJmxcG/f6ODLfihcA/MV3777u6iadPY0/444AwYFre5u3rv/u/LnLrila2WNxNFgWZAyOeHhMoryypFwyZFCvk9fxqKn8WqlnesJXVSYmLh9vj2ztoX3B1piuYZWbM0aJNrnXR44XUxQfH2r3Xv6du677xRgqe5xoZ/yzyzq7ZMlx8zojA2/GAfiv9bHq8Y8GbFy5czpljOdzR1Dqea5nxkn5alu5JnMqkqVHBcUrIsab/VhepWONtE915TJe7FVZ2hhsm0XY5fDyZtHFXr946w/vvv5KrzSLiBl8BAhe3oRvfG3esv76veYfchUGbDlOw44MUqOa1/blQS6XTJuRIHtREJpb2fLA9zpCqL1aqyWmFsx22QZLJbAXV/H1OFOo4kP7DRPnxItOZJaBj7QFNyffPzDUueD7G27Yo0904/6mdNTtVDRjy62DDnjyuXhT2jtxNDhahy/c2pnInpw9s72vOcDnjmiUu0D1+MhNqU4k8ucKcd1KB5TZHAuT6qRYsxbbMl6dbiyTwMdswP+vYg6868aN194cy2cj3eSnGd/XZXs/df/OUO+1eDvy63GwPjCeCGkgWifJN9o6aBzj+9wRTXLqT0Zm9YmeVRLZEH4MEllgWF3GiUwIKy2Tmeo06wKJdRtexvUTrHne/eN7vrPHXte3Pk40r/PbRHVnBO7gfZ+yohjAK8Kz4hXh3oEeESwArJMhN0nognECRmUTWc+bLjUq+p4TZKHWch2qbxaq+CBxepFt1VV+vE11Yhlf9aiBX/wab617/8Dgts/MtLdhx+2dDnos/0xHfdNmc9Gi44/Gm7heh4F8GUZ1Px4RbNVuAWqdDblJQrNiTsCpPJ0MqZwo0zeZ8lS/SR6k0I8VITB7qhsjqxNEMYkBsZHoYX1DFNb4+G1G8eHBke2fufH+Gx8uox4Zpaq39vB+L178pMNbvdarMLovx95tGZZIGGM5zfPBZJ0OeRxmwQHGDTiVWZCmckoD1qjAi+VxaAek2i9tIYzlVqdhYtnYPGjy5Ba+wL8f4d2mH9vc6Xzxtvu+N+N+p2v92BV5nf92Rb3TXsfixU87KO90z87z4nyM/JN4qNeJwCODdts6H/Iy3xrZiDdFAFMMdU1ssphXpQ0d9IipJMACUqWxfXJiOWVyLb/obQb5DVxA/sTQXcNX35zdPKPezlDp5y5ixL7aRVXu6mqOG1x8QOtZeav1MnT2VEwEvI2ZcyG+cqRtMmdYQFnZWmx8lk3mcyNEpoWI5fGqW5XHNmNMyme5LtlRibIQ9DzyFb9Cny/t5dnnf7HxO1jy9FPsgXiMYv6spBctOu6Qgbz1AqyAz0YHn4EXmPI15e7IUBPULmzrnGSTwWSW01wajMLjxqUSNpoaZb6hNbf6jBtjydOg51mP/LsdrG/kRfHFB4d63103wz7zZH2YCXnqx5nQpl3SBr61Dkuk52IfeRrC5qnYSx6Cy6mom+cMbIJsfHhaAKYOMz41TGa58KJCHTbWUzooBIqSYF9pWHMns3jXZg/tvw2HtWtbRfGV9ujgD3764HWz+kPg4pAp2KQ+ngKTe54JPGqxqBhtPRFXkE5EFD8DofVo/O3HXbk4SE6ibUKoy+oc59DiAJNbTmbdkUH4oqGbGK/7dUVQ1+zzKzUorWvlxS141fL1rXZx/fCcwV+sndzXaaJaH7lk2d+PXD+Uer50/ycv67V7j8VnU49vtbInIP6PgaOWIQDnY0/rsULpvADPEyK3YGUhaAQ6MuMDW3QgIF63WM7o12d+j3rXoh0/bxf5TVmruHlgW37bzx/67h7/OLI4azdu4rHZjc2Y2VWvWHHC3N7WzUu62cBKLDHw+EV2FO6YrsQufSmWT7gLne+D+Oenj4YYuOVJElwcKNdfPbLwyb5tkA2D+wByfHwvvxMT6nd45uk3sLV6qDdw+y/vvY5vWZgxL5V1Pdjjs8qY7PE92sUdOPDAYxfMK+YuzIuhfTpZsQ+WI3tjCizEvnte3svnYpk+gCapn3v4dg5+UILdOgK+GO5lbQR996HBVuuh1sD2h3rzDtq0evXX96gfle9id/er63ug74G+B/oe6Hug74G+B/oe6Hug74G+B/oe6Hug74G+B/oe6Hug74G+B/oe6Hug74G+Bybsgf8PToXQdtpa8L4AAAAASUVORK5CYII=";

// Resolves to true when the POST left the browser without a network error. Because the request
// is sent no-cors the response is opaque, so this cannot confirm the Apps Script actually wrote
// the row — it only rules out the user being offline or the endpoint being unreachable.
const sendToGoogleSheets = async (data: any): Promise<boolean> => {
    // SANITIZATION FIX:
    // Create a clean object to ensure no circular references (like DOM Events) are passed to JSON.stringify
    const cleanPayload = {
        timestamp: new Date().toLocaleString(),
        source: typeof data.source === 'string' ? data.source : 'Unknown',
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        // The form field is named projectDescription; mirror it into `description` so the sheet
        // gets the text whichever of the two column names the Apps Script reads.
        description: typeof data.projectDescription === 'string' && data.projectDescription
            ? data.projectDescription
            : typeof data.description === 'string' ? data.description : '',
        // Fallback for any other string properties, but ignore objects/functions
        ...Object.keys(data).reduce((acc, key) => {
            if (key !== 'source' && key !== 'name' && key !== 'email' && key !== 'description') {
                if (typeof data[key] === 'string' || typeof data[key] === 'number' || typeof data[key] === 'boolean') {
                    acc[key] = data[key];
                }
            }
            return acc;
        }, {} as any)
    };

    if (GOOGLE_SHEETS_WEBHOOK_URL === "INSERT_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        console.log("⚠️ Google Sheets URL not set. Data would have been sent:", cleanPayload);
        return false;
    }

    try {
        // mode: 'no-cors' is necessary for Google Apps Script Web Apps. It also restricts
        // Content-Type to the safelisted values, so send text/plain — Apps Script reads the raw
        // body via e.postData.contents either way. Declaring application/json here gets dropped.
        await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(cleanPayload),
        });
        console.log("✅ Data sent to Google Sheets");
        return true;
    } catch (error) {
        console.error("❌ Error sending to Google Sheets:", error);
        return false;
    }
};

// --- Data for Components ---
const servicesData = [
    { 
        icon: '🤖', 
        title: 'Automation & Agents', 
        description: 'Custom agents to streamline your workflows.', 
        color: 'bg-brand-purple', 
        graphic: 'fas fa-robot',
        explanation: "Imagine having a super-smart assistant for your computer. We build 'agents'—little software robots—that can do boring, repetitive tasks for you automatically. Things like sorting emails, filling out forms, or gathering data from websites. It's like putting your workflow on autopilot so you can focus on the important stuff."
    },
    {
        icon: '🧭',
        title: 'AI Audit & Strategy Sprint',
        description: 'Two to four weeks to find what is worth building.',
        color: 'bg-brand-red',
        graphic: 'fas fa-compass',
        explanation: "Most teams know they should be doing something with AI, but not what, or where it would actually pay off. Over two to four weeks we map how work really moves through your business, score each opportunity by effort against payoff, and hand you a ranked roadmap. It's a paid engagement and it stands on its own—the roadmap is yours to take to any developer, including one who isn't us."
    },
    { 
        icon: '📚', 
        title: 'RAG Systems', 
        description: 'AI grounded in your proprietary knowledge.', 
        color: 'bg-brand-lime', 
        graphic: 'fas fa-book',
        explanation: "This is like giving an AI an 'open book' test. Instead of trying to memorize everything, a RAG system can look up information from your private documents or database in real-time before answering a question. This ensures the AI gives you the most accurate, up-to-date answers based on *your* knowledge, not just what it learned from the internet."
    },
    { 
        icon: '💻', 
        title: 'Software Development', 
        description: 'Bespoke web apps and enterprise platforms.', 
        color: 'bg-brand-yellow', 
        graphic: 'fas fa-code',
        explanation: "This is about building custom tools from the ground up. Need a unique website, a mobile app for your customers, or a powerful internal dashboard for your team? We design and code software that is tailor-made to solve your specific problems and help your business run smoothly."
    },
    { 
        icon: '🎬', 
        title: 'Video Production', 
        description: 'Engaging, AI-enhanced video content.', 
        color: 'bg-brand-purple', 
        graphic: 'fas fa-video',
        explanation: "We create professional videos for your brand, but with an AI-powered twist. We can use AI to help with scriptwriting, generate realistic voiceovers, create animations, or even edit footage faster. The result is high-quality, engaging video content that captures your audience's attention, made more efficiently."
    },
    { 
        icon: '🚀', 
        title: 'AI Products', 
        description: 'Launch new AI-powered SaaS platforms.', 
        color: 'bg-brand-red', 
        graphic: 'fas fa-rocket',
        explanation: "Have a big idea for a new app or service that uses AI? We can help you build it from concept to launch. This is about creating a complete, market-ready product—like a new photo editing app with AI filters or a smart scheduling tool—that you can offer to your customers."
    },
];

const productsData = [
    {
        title: 'CAFECITO',
        subtitle: 'Agent Control Plane',
        description: "An integration control plane for AI agent fleets. Prove independence when you can. Re-derive when you can't. Never resolve a conflict.",
        icon: 'fas fa-mug-hot',
        accent: 'text-brand-lime',
        border: 'group-hover:border-brand-lime',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#A3F953]',
        links: {
            website: 'https://cafeci.to/'
        }
    },
    {
        title: 'NOTIFY',
        subtitle: 'Property Management AI',
        description: 'A property management mobile app powered by AI agents tracking tenant requests.',
        icon: 'fas fa-building-user',
        accent: 'text-brand-purple',
        border: 'group-hover:border-brand-purple',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#5F2EEA]',
        links: {
            ios: 'https://apps.apple.com/us/app/notify-tenant/id1541300268',
            android: 'https://play.google.com/store/apps/details?id=app.gdigic.ntofy&hl=en_US',
            webApp: 'https://admin.ntofy.com/'
        }
    },
    {
        title: 'DOG KITCHEN',
        subtitle: 'AI Infrastructure Layer',
        description: 'Building the infrastructure layer for AI development. A single platform that aggregates, curates, and surfaces the resources, data, and intelligence AI developers need to ship faster.',
        icon: 'fas fa-layer-group',
        accent: 'text-brand-yellow',
        border: 'group-hover:border-brand-yellow',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#F5D324]',
        links: {
            website: 'https://dogkitchen.io/'
        }
    },
    {
        title: 'SCHOOLZ',
        subtitle: 'EdTech Platform',
        description: 'Comprehensive School Management Platform. Includes a smart feature for collecting and tracking student phones to create a distraction-free classroom experience.',
        icon: 'fas fa-school',
        accent: 'text-brand-red',
        border: 'group-hover:border-brand-red',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#FF4B4B]',
        links: {
            website: 'https://schoolz.me/',
            webApp: 'https://admin.schoolz.me/login',
        }
    },
    {
        title: 'LOOMINO.AI',
        subtitle: 'Agentic Productivity',
        description: 'AI First Project Management software powered by agents to help you get stuff done.',
        icon: 'fas fa-list-check',
        accent: 'text-brand-lime',
        border: 'group-hover:border-brand-lime',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#A3F953]',
        links: {
            webApp: 'https://loomino.ai/'
        }
    },
    {
        title: 'STAFFY.IO',
        subtitle: 'Generative Audio',
        description: 'AI Music Generator creating royalty-free soundscapes for creators.',
        icon: 'fas fa-music',
        accent: 'text-brand-pink',
        border: 'group-hover:border-brand-pink',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#FCE7F3]',
        links: {
            website: 'https://staffy.io'
        }
    },
    {
        title: 'GAMEONCLASS',
        subtitle: 'Classroom Gamification',
        description: 'Turn any lesson into a game. Teachers create, students compete, and AI does the heavy lifting — the classroom arcade that makes every subject feel like recess.',
        icon: 'fas fa-gamepad',
        accent: 'text-brand-purple',
        border: 'group-hover:border-brand-purple',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#5F2EEA]',
        links: {
            website: 'https://gameonclass.com/'
        }
    },
    {
        title: 'UESDAD',
        subtitle: 'NYC Community App',
        description: 'Connect, trade, and discover local perks with a vetted community of dads in your neighborhood. An exclusive mobile app curated for the modern New York family.',
        icon: 'fas fa-users',
        accent: 'text-brand-yellow',
        border: 'group-hover:border-brand-yellow',
        glow: 'group-hover:shadow-[0_0_30px_-5px_#F5D324]',
        links: {
            website: 'https://uesdad.nyc/',
            ios: 'https://apps.apple.com/us/app/uesdad/id6759264279'
        }
    },
];

const teamData = [
    { name: 'Victor', role: 'Founder / AI Engineer', color: 'bg-brand-purple', text: 'text-white', icon: 'fas fa-user-astronaut', linkedin: 'http://www.linkedin.com/in/geekingout' },
    { name: 'Usama', role: 'AI Engineer', color: 'bg-brand-lime', text: 'text-brand-black', icon: 'fas fa-laptop-code' },
    { name: 'Nahuel', role: 'Software Developer', color: 'bg-brand-pink', text: 'text-brand-black', icon: 'fas fa-code' },
    { name: 'Miguel', role: 'Systems Engineer', color: 'bg-brand-yellow', text: 'text-brand-black', icon: 'fas fa-server' },
    { name: 'Lucia', role: 'Product Manager', color: 'bg-brand-red', text: 'text-white', icon: 'fas fa-clipboard-check' },
    { name: 'AQ', role: 'Mobile App Engineer', color: 'bg-brand-purple', text: 'text-white', icon: 'fas fa-mobile-screen' },
    { name: 'Patri', role: 'AI/Data Engineer', color: 'bg-brand-lime', text: 'text-brand-black', icon: 'fas fa-database' },
];

const testimonialsData = [
    {
        name: "Aerial Best",
        role: "NYC DOE",
        text: "My principal loves this! She says it looks amazing!",
        color: "bg-brand-pink"
    },
    {
        name: "Principal Kayode Ayetiwa",
        role: "Humanities and Art HS",
        text: "I will certainly recommend your service to other schools as well as I am impressed with your business model.",
        color: "bg-brand-lime"
    },
    {
        name: "Mike Person, PMP®, SSM, ITIL",
        role: "IT Project Manager @ CACI International Inc",
        text: "I worked with Victor on several projects and can tell you that he is very astute at several technical roles including web developer, CRM developer, and in processes like data migration. Victor is extremely detail oriented, persevering, very reliable, has a great work ethic and a terrific sense of humor. I highly recommend Victor.",
        color: "bg-brand-purple"
    },
    {
        name: "Alexandria Dycus, RN, MSN, FNP",
        role: "Vanderbilt University Medical Center",
        text: "Victor is a highly skilled developer that made sure I understood the entire process and that all my options were clearly explained to me. Together we built a crm to manage leads and take them through our sales funnel. We are very happy with the application and recommend Victor for your next project.",
        color: "bg-brand-red"
    },
    {
        name: "Jason Lay",
        role: "Network Infrastructure Advisor",
        text: "Working with Victor was an enlightening experience. It's hard to find someone with knowledge and skills who also possesses an intrinsic ability to work seamlessly in a team setting. He brought value to every project we worked on, and a 'can do' attitude with every problem we encountered.",
        color: "bg-brand-lime"
    },
    {
        name: "Nahuel Gorosito",
        role: "Creative Technologist @ OUTFRONT Media",
        text: "Victor is highly skilled and efficient at what he does. I am very happy with my actor’s website that he created with his innovative site building platform, Geekingout. He is also a man of integrity who will go above and beyond the client’s needs.",
        color: "bg-brand-yellow"
    },
    {
        name: "John Vogel",
        role: "Helping Businesses with IT & Production Support",
        text: "Victor was an integral part of the Innovation team. He proposed, developed, and implemented our core software backbone, including a business-critical CRM. He respects a growing firm's budget and proposes clean, pragmatic solutions. He is so upfront, responsive, and responsible.",
        color: "bg-brand-purple"
    },
    {
        name: "Ralph Wilburn",
        role: "Founder Mobile Barber Ralph",
        text: "Working with Victor was a pleasure. The quality of his work is top notch and he is a great guy to work with. Very patient and great attention to detail. I highly recommend working with him.",
        color: "bg-brand-red"
    },
    {
        name: "Andrew Ayala",
        role: "Actor / Creative",
        text: "Geeking out is an awesome site, the display is great, anything I'd like added to the site is a breeze. Victor is as dedicated as they come, I highly recommend his services, continued success to Victor and Geeking out.",
        color: "bg-brand-lime"
    },
    {
        name: "Conor Briody",
        role: "CRM Technology Lead @ Jupiter AM",
        text: "Victor's ability to architect applications to make all aspects of the business run smoothly was astounding. Regardless of how complex a project was - Victor had a second to none ability to design innovative solutions in a short timeframe. Working with Victor has been an indescribable pleasure.",
        color: "bg-brand-yellow"
    }
];

const philosophyData = [
    { number: '01', icon: 'fas fa-bullseye', title: 'Solve the Right Problem', description: 'We dive deep, past the symptoms, to identify the core challenge.' },
    { number: '02', icon: 'fas fa-comments', title: 'Transparent & Jargon-Free', description: 'You\'ll get clear, direct updates and strategic advice.' },
    { number: '03', icon: 'fas fa-lightbulb', title: 'Obsessed with What\'s Next', description: 'We are constantly mastering new AI frameworks to keep you ahead of the curve.' },
];

const processData = [
  {
    phase: 'Phase A – Discovery & Strategy',
    steps: [
      { icon: 'fas fa-file-alt', text: 'Specifications & Planning' },
      { icon: 'fas fa-drafting-compass', text: 'Designs, Wireframe & Prototype' },
      { icon: 'fas fa-chart-line', text: 'Estimates & Timeline' },
    ],
  },
  {
    phase: 'Phase B – Development',
    steps: [
      { icon: 'fas fa-database', text: 'Data Collection & Preparation' },
      { icon: 'fas fa-vial', text: 'Experimentation & Modeling' },
      { icon: 'fas fa-desktop', text: 'Feature Development & Testing' },
      { icon: 'fas fa-rocket', text: 'Deployment & Integration' },
      { icon: 'fas fa-shield-alt', text: 'Maintain & Monitor' },
    ],
  },
];

const faqData = [
  { question: "What are 'Automation & Agents' and how can they help me?", answer: "Automation involves creating custom 'agents' that handle repetitive, complex tasks. This could be anything from processing invoices and customer support emails to analyzing market data, freeing up your team for high-value work." },
  { question: "Can you work with the tools we already use?", answer: "Usually yes, and that's the starting assumption. Most of what we build connects the systems you already pay for rather than replacing them: your CRM, inbox, Slack, spreadsheets, ticketing. If something genuinely can't be connected, we'll tell you early rather than bill you to find out." },
  { question: "What happens in an 'AI Audit & Strategy Sprint'?", answer: "Over two to four weeks we map how work actually moves through your business, then score each opportunity by the effort it takes against what it returns. You get a ranked roadmap of what to build and in what order. It's a paid engagement, and the roadmap is yours whether or not you build any of it with us." },
  { question: "How much does a project cost?", answer: "It depends on scope, so we quote per project rather than off a rate card. Most engagements share the same shape: a fixed build fee to design and ship the thing, then an optional monthly retainer if you want us to keep it running and improving as your business changes. You get the full number in writing before any work starts." },
  { question: "How long before we see something working?", answer: "For a focused automation or a single agent, usually weeks rather than months. We would rather put a working slice in front of you early than disappear for a quarter. Larger platforms take longer and get broken into milestones so you can see progress throughout. If the scope isn't clear yet, the Audit & Strategy Sprint is the fastest way to get a real timeline." },
  { question: "What happens to our data?", answer: "It stays yours. Wherever possible we build inside your own accounts and infrastructure, so your data doesn't take a detour through ours. For knowledge assistants we mirror the permissions you already have—if someone can't open a document today, the assistant won't surface it to them tomorrow. We'll walk you through where data lives and who can reach it before we build anything." },
  { question: "Which AI models do you use?", answer: "Whichever fits the job. We aren't tied to a single vendor, and we choose based on what your use case actually needs: accuracy, speed, cost, and whether your data is allowed to leave your environment. We also build so the model can be swapped later, because this field moves quickly and you shouldn't be locked into today's best option forever." },
  { question: "Is this going to replace our team?", answer: "That isn't what we build. These systems take on the repetitive part—the copying between systems, the same twenty support questions, the hunt for a document someone filed two years ago. The judgment calls stay with your people, and so does the final say." },
  { question: "Do you only work with big companies?", answer: "Nope! We love working with small and medium-sized businesses just as much as larger enterprises. Our services are scalable, meaning we can build a plan that fits your exact needs and budget." },
  { question: "What kind of 'AI Products' can you build?", answer: "We can help you conceptualize, design, and build entirely new software applications with AI at their core. This includes internal tools to boost productivity or new SaaS (Software as a Service) platforms you can sell to your customers." },
];

const termsContent = `
1. Terms
By accessing the website at https://geekingout.net/, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.

2. Use License
Permission is granted to temporarily download one copy of the materials (information or software) on Geeking Out, LLC’s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
- modify or copy the materials;
- use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
- attempt to decompile or reverse engineer any software contained on Geeking Out, LLC’s website;
- remove any copyright or other proprietary notations from the materials; or
- transfer the materials to another person or “mirror” the materials on any other server.
This license shall automatically terminate if you violate any of these restrictions and may be terminated by Geeking Out, LLC at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.

3. Disclaimer
The materials on Geeking Out, LLC’s website are provided on an ‘as is’ basis. Geeking Out, LLC makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
Further, Geeking Out, LLC does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.

4. Limitations
In no event shall Geeking Out, LLC or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Geeking Out, LLC’s website, even if Geeking Out, LLC or a Geeking Out, LLC authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.

5. Accuracy of materials
The materials appearing on Geeking Out, LLC’s website could include technical, typographical, or photographic errors. Geeking Out, LLC does not warrant that any of the materials on its website are accurate, complete or current. Geeking Out, LLC may make changes to the materials contained on its website at any time without notice. However Geeking Out, LLC does not make any commitment to update the materials.

6. Links
Geeking Out, LLC has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Geeking Out, LLC of the site. Use of any such linked website is at the user’s own risk.

7. Modifications
Geeking Out, LLC may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.

8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of New York City and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
`;

const privacyContent = `
Your privacy is important to us. It is Geeking Out, LLC’s policy to respect your privacy regarding any information we may collect from you across our website, https://geekingout.net/, and other sites we own and operate.

We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.

We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.

We don’t share any personally identifying information publicly or with third-parties, except when required to by law.

Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies. You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.

Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
`;

// --- Sub-Components ---

const Header: React.FC<{ 
    onContactClick: () => void; 
    isMenuOpen: boolean; 
    setIsMenuOpen: (isOpen: boolean) => void;
    toggleTheme: () => void;
    isDark: boolean;
}> = ({ onContactClick, isMenuOpen, setIsMenuOpen, toggleTheme, isDark }) => {
    const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { name: 'Services', href: '#services' },
        { name: 'Products', href: '#products' },
        { name: 'Philosophy', href: '#philosophy' },
        { name: 'Team', href: '#team' },
        { name: 'Process', href: '#process' },
        { name: 'FAQ', href: '#faqs' },
    ];

    const socialLinks = [
        { icon: 'fab fa-instagram', href: 'https://www.instagram.com/geekingoutnet/', label: 'Instagram' },
        { icon: 'fab fa-x-twitter', href: 'https://x.com/geekingoutnet', label: 'X (Twitter)' },
        { icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/company/geeking-out', label: 'LinkedIn' },
    ];
    
    const closeMenu = () => setIsMenuOpen(false);

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const { offsetLeft, offsetWidth } = e.currentTarget;
        setHoverStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    };

    const handleMouseLeave = () => {
        setHoverStyle(prev => ({ ...prev, opacity: 0 }));
    };

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const element = document.getElementById(targetId);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            closeMenu();
        }
    };

    return (
    <>
        <header className="fixed top-0 left-0 w-full z-50 p-4 backdrop-blur-sm bg-brand-off-white/80 dark:bg-gray-900/80 transition-all duration-300">
            {/* UPDATED: justify-center for mobile, justify-between for desktop (md+). Relative positioning for centering logic. */}
            <div className="container mx-auto max-w-7xl flex justify-center md:justify-between items-center relative">
                <a href="#" className="flex items-center gap-4 group" aria-label="Geeking Out Agency Home">
                    <div className="relative">
                        {/* bg-brand-purple panel with the mark inverted to white on top of it */}
                        <div className="w-14 h-14 bg-brand-purple rounded-xl flex items-center justify-center border-2 border-brand-black dark:border-white shadow-[4px_4px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_#FFFFFF] transition-all duration-200 group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-[2px_2px_0px_#1A1A1A] overflow-hidden">
                            <img
                                src={LOGO_SRC}
                                alt="Geeking Out Logo"
                                className="w-10 h-10 object-contain brightness-0 invert"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-black text-3xl leading-none tracking-tight text-brand-black dark:text-white group-hover:text-brand-purple transition-colors">
                            Geeking Out
                        </span>
                        <div className="flex items-center mt-1">
                            <span className="bg-brand-purple text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase">
                                &lt;Digital Agency/&gt;
                            </span>
                        </div>
                    </div>
                </a>

                {/* Desktop Nav */}
                <nav ref={navRef} onMouseLeave={handleMouseLeave} className="hidden lg:flex items-center gap-2 relative" aria-label="Desktop Navigation">
                    <div 
                        className="absolute bg-brand-purple/10 dark:bg-brand-purple/30 backdrop-blur-sm border border-brand-purple/20 rounded-full transition-all duration-300 ease-out -z-10"
                        style={{ ...hoverStyle, height: '36px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    {navLinks.map(link => (
                        <a 
                            key={link.name} 
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href)}
                            onMouseEnter={handleMouseEnter}
                            className="font-semibold text-brand-black/70 dark:text-gray-300 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors px-4 py-1 relative z-10"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* Right Controls: Absolute on mobile to prevent layout shift, static on desktop */}
                <div className="absolute right-0 md:static flex items-center gap-4">
                     <div className="hidden sm:flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors" aria-label="Toggle Dark Mode">
                            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        {socialLinks.map((link, index) => (
                             <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors">
                                <i className={link.icon}></i>
                            </a>
                        ))}
                         <button 
                            onClick={onContactClick}
                            className="bg-white dark:bg-gray-800 text-brand-black dark:text-white px-6 py-3 rounded-full font-bold border-2 border-brand-black dark:border-white sticker-card sticker-hover"
                         >
                            Get In Touch
                        </button>
                     </div>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu" className="lg:hidden md:block hidden text-2xl z-50 text-brand-black dark:text-white">
                        <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>
        </header>

        {/* Mobile/Tablet Menu Overlay */}
        {isMenuOpen && (
            <div className="fixed inset-0 bg-brand-off-white dark:bg-gray-900 z-40 flex flex-col items-center justify-center animate-fade-in lg:hidden">
                <nav className="flex flex-col items-center gap-8 text-center" aria-label="Mobile Navigation">
                    {navLinks.map(link => (
                        <a 
                            key={link.name} 
                            href={link.href} 
                            onClick={(e) => handleNavClick(e, link.href)} 
                            className="font-bold text-3xl text-brand-black dark:text-white hover:text-brand-purple dark:hover:text-brand-yellow transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>
                <div className="flex items-center gap-6 mt-12">
                     <button onClick={toggleTheme} className="text-3xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors" aria-label="Toggle Dark Mode">
                            <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                     </button>
                     {socialLinks.map((link, index) => (
                        <a key={index} href={link.href} onClick={closeMenu} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="text-3xl text-brand-black/60 dark:text-white/60 hover:text-brand-purple dark:hover:text-brand-yellow transition-colors">
                            <i className={link.icon}></i>
                        </a>
                    ))}
                </div>
                <button 
                    onClick={() => {
                        onContactClick();
                        closeMenu();
                    }}
                    className="mt-12 bg-white dark:bg-gray-800 text-brand-black dark:text-white px-8 py-4 rounded-full font-bold border-2 border-brand-black dark:border-white sticker-card sticker-hover text-lg"
                >
                    Get In Touch
                </button>
            </div>
        )}
    </>
    );
};

const MobileNavBar: React.FC<{ onContactClick: () => void; isMenuOpen: boolean; onMenuToggle: () => void; }> = ({ onContactClick, isMenuOpen, onMenuToggle }) => {
    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 80;
            const top = el.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-[60] md:hidden pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]" aria-label="Bottom Mobile Navigation">
            <div className="flex items-center justify-around h-16 px-2 relative">
                 {/* Item 1: Services */}
                 <button onClick={() => scrollToSection('services')} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 dark:text-white/60 focus:text-brand-purple dark:focus:text-brand-yellow active:text-brand-purple dark:active:text-brand-yellow transition-colors group">
                    <i className="fas fa-layer-group text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Services</span>
                 </button>

                 {/* Item 2: Products */}
                 <button onClick={() => scrollToSection('products')} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 dark:text-white/60 focus:text-brand-purple dark:focus:text-brand-yellow active:text-brand-purple dark:active:text-brand-yellow transition-colors group">
                    <i className="fas fa-box-open text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Products</span>
                 </button>

                 {/* Center Spacer for Button */}
                 <div className="w-full pointer-events-none"></div>

                 {/* Item 4: Contact */}
                 <button onClick={onContactClick} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 dark:text-white/60 focus:text-brand-purple dark:focus:text-brand-yellow active:text-brand-purple dark:active:text-brand-yellow transition-colors group">
                    <i className="fas fa-paper-plane text-xl mb-1 group-active:scale-90 transition-transform"></i>
                    <span className="text-[10px] font-bold">Contact</span>
                 </button>

                 {/* Item 5: Menu Toggle */}
                 <button onClick={onMenuToggle} className="flex flex-col items-center justify-center w-full h-full text-brand-black/60 dark:text-white/60 focus:text-brand-purple dark:focus:text-brand-yellow active:text-brand-purple dark:active:text-brand-yellow transition-colors group">
                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl mb-1 group-active:scale-90 transition-transform`}></i>
                    <span className="text-[10px] font-bold">{isMenuOpen ? 'Close' : 'Menu'}</span>
                 </button>

                 {/* Floating Center Button */}
                 <button
                    onClick={onContactClick}
                    aria-label="Start a project"
                    className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-14 h-14 bg-brand-purple text-white rounded-full shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] flex items-center justify-center border-4 border-brand-off-white dark:border-gray-800 text-2xl z-10 hover:scale-110 active:scale-95 transition-all duration-200"
                 >
                    <i className="fas fa-rocket"></i>
                 </button>
            </div>
        </nav>
    );
};

const ThreeGridBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const frameIdRef = useRef<number>(0);
    // Observe theme changes to update THREE js color
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                     setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);
  
    useEffect(() => {
        if (!mountRef.current) return;
  
        const scene = new THREE.Scene();
        // Update bg color based on theme
        const bgHex = isDark ? '#111827' : '#F8F8F8';
        scene.background = new THREE.Color(bgHex); 
        scene.fog = new THREE.Fog(bgHex, 10, 50);
  
        const camera = new THREE.PerspectiveCamera(70, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);
        camera.lookAt(0, 0, 0);
  
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
  
        const geometry = new THREE.PlaneGeometry(100, 100, 60, 60);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x5F2EEA, 
            wireframe: true,
            transparent: true,
            opacity: 0.2 
        });
        
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);
  
        const originalPositions = Float32Array.from(geometry.attributes.position.array);
        const count = geometry.attributes.position.count;
        const clock = new THREE.Clock();
  
        const animate = () => {
            const time = clock.getElapsedTime();
            const positionAttribute = geometry.attributes.position;
            
            for (let i = 0; i < count; i++) {
                const x = originalPositions[i * 3];
                const y = originalPositions[i * 3 + 1];
                const waveHeight = 1.5;
                const z = Math.sin(x * 0.2 + time * 0.5) * Math.cos(y * 0.2 + time * 0.3) * waveHeight;
                positionAttribute.setZ(i, z);
            }
            positionAttribute.needsUpdate = true;
            plane.rotation.z = time * 0.05;
    
            renderer.render(scene, camera);
            frameIdRef.current = requestAnimationFrame(animate);
        };
  
        animate();
  
        const handleResize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
  
        window.addEventListener('resize', handleResize);
  
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameIdRef.current);
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
        };
    }, [isDark]);
  
    return <div ref={mountRef} className="absolute inset-0 w-full h-full -z-1 pointer-events-none" aria-hidden="true" />;
};

const HeroSection: React.FC<{ onSubmit: (msg: string) => void }> = ({ onSubmit }) => {
    const [inputValue, setInputValue] = useState('');
    const [placeholderText, setPlaceholderText] = useState('What will you create? The possibilities are endless.');

    useEffect(() => {
        const updatePlaceholder = () => {
            if (window.innerWidth < 768) {
                setPlaceholderText('What will you create?');
            } else {
                setPlaceholderText('What will you create? The possibilities are endless.');
            }
        };

        updatePlaceholder();
        window.addEventListener('resize', updatePlaceholder);
        return () => window.removeEventListener('resize', updatePlaceholder);
    }, []);

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSubmit(inputValue);
            setInputValue('');
        }
    };

    return (
        <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden p-6">
            <ThreeGridBackground />
            {/* Floating AI Agent 1 */}
            <div data-sticker="true" data-speed="0.5" className="hidden md:flex absolute top-40 left-[10%] w-24 h-24 bg-brand-yellow rounded-full items-center justify-center text-brand-black text-4xl shadow-lg z-10">
                <i className="fas fa-robot"></i>
            </div>
            {/* Floating AI Agent 2 */}
            <div data-sticker="true" data-speed="-0.3" className="hidden md:flex absolute bottom-24 right-[20%] w-32 h-32 bg-brand-lime rounded-2xl -rotate-12 items-center justify-center text-brand-black text-5xl shadow-lg z-10">
                <i className="fas fa-brain"></i>
            </div>
            {/* Floating AI Agent 3 */}
            <div data-sticker="true" data-speed="0.2" className="hidden md:flex absolute top-24 right-[15%] w-20 h-20 bg-brand-red rounded-lg rotate-12 items-center justify-center text-white text-3xl shadow-lg z-10">
                <i className="fas fa-code-branch"></i>
            </div>

            <div className="relative z-20 text-center max-w-4xl mx-auto">
                {/* Each line stays `block` at every breakpoint so "Human-Engineered." is always on
                    its own row, and nowrap keeps it there in one piece: the entrance animation
                    splits these into per-character inline-block spans, which the browser would
                    otherwise treat as break opportunities and wrap mid-word. */}
                <h1 className="font-black text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-tight md:leading-none mb-8 md:mb-12 dark:text-white">
                    <span className="block whitespace-nowrap" data-hero-word="AI-Powered.">AI-Powered. </span>
                    <span className="block whitespace-nowrap text-brand-purple dark:text-brand-yellow" data-hero-word="Human-Engineered.">Human-Engineered.</span>
                </h1>
                
                <div className="mt-8 relative max-w-2xl mx-auto w-full group" data-hero-sub>
                    <div className="absolute inset-0 bg-brand-black dark:bg-brand-purple rounded-xl translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3"></div>
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder={placeholderText}
                        aria-label="Describe what you want to build"
                        className="relative w-full bg-white dark:bg-gray-800 dark:text-white border-2 border-brand-black dark:border-brand-purple rounded-xl py-4 px-6 text-lg md:text-xl font-mono shadow-sm focus:outline-none focus:ring-0 placeholder:text-brand-black/40 dark:placeholder:text-white/40 text-center md:text-left"
                        autoFocus
                    />
                    <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 text-brand-black/30 dark:text-white/30 pointer-events-none">
                        <i className="fas fa-level-down-alt rotate-90"></i>
                    </div>
                </div>

                <div className="mt-10" data-hero-sub>
                    <button onClick={handleSubmit} className="inline-block bg-brand-purple text-white px-10 py-4 rounded-xl font-bold border-2 border-brand-black dark:border-white text-xl sticker-card sticker-hover shadow-[4px_4px_0px_#1A1A1A] dark:shadow-[4px_4px_0px_#FFFFFF]">
                        Submit
                    </button>
                </div>
            </div>
        </section>
    );
};

const ScrollingTicker: React.FC = () => {
    const items = [
        'Workflow Automation & AI Ops',
        'Support & Sales Agents',
        'Knowledge Assistants (RAG)',
        'AI Audit & Strategy Sprint',
        'Content & Marketing Systems',
    ];
    // The marquee animates to translateX(-50%), so the copy count must be even for the loop to be
    // seamless — at the halfway point the third copy has to land exactly where the first began.
    // Four rather than two also keeps the band full at the end of a cycle on very wide displays.
    const repeatedItems = [...items, ...items, ...items, ...items];
    return(
        <div className="py-6 bg-brand-yellow border-y-4 border-brand-black dark:border-white overflow-hidden headline-skew my-12" aria-hidden="true">
            <div className="w-full inline-flex flex-nowrap">
                <div className="flex items-center justify-center animate-infinite-scroll space-x-12">
                    {repeatedItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 text-brand-black flex-shrink-0">
                            <span className="text-4xl font-extrabold whitespace-nowrap">{item}</span>
                            <i className="fas fa-bolt text-3xl"></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ServicesSection: React.FC<{ onServiceClick: (service: any) => void }> = ({ onServiceClick }) => (
    <section id="services" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
            <h2 className="text-5xl md:text-7xl font-black text-center mb-4 headline-skew dark:text-white">Our Services</h2>
            <p className="text-center text-lg max-w-2xl mx-auto mb-16 text-brand-black/70 dark:text-gray-300">Your one-stop-shop for everything AI & software. We concept, build, and scale your vision.</p>
            <div className="flex flex-col gap-6">
                {servicesData.map((service, index) => (
                    <article 
                        key={index} 
                        className="group bg-white dark:bg-gray-800 sticker-card sticker-hover p-6 rounded-2xl flex items-center gap-6 cursor-pointer"
                        onClick={() => onServiceClick(service)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onServiceClick(service)}
                        aria-label={`Learn more about ${service.title}`}
                    >
                        <div className={`w-16 h-16 ${service.color} rounded-lg flex-shrink-0 flex items-center justify-center text-white text-3xl`}>
                           <i className={service.graphic}></i>
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-3xl font-bold dark:text-white">{service.title}</h3>
                            <p className="mt-1 text-brand-black/70 dark:text-gray-300">{service.description}</p>
                        </div>
                         <div className="text-3xl text-brand-black/50 dark:text-white/50 group-hover:text-brand-purple dark:group-hover:text-brand-yellow transition-transform duration-300 transform group-hover:translate-x-2">
                            <i className="fas fa-arrow-right"></i>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    </section>
);

const ProductsSection: React.FC = () => {
    const handleProductClick = (product: any) => {
        // Find the first available link and open it
        if (product.links) {
            const firstLink = Object.values(product.links)[0] as string;
            if (firstLink) {
                window.open(firstLink, '_blank', 'noopener,noreferrer');
            }
        }
    };

    return (
        <section id="products" className="py-24 px-6 bg-brand-black bg-radiant text-white overflow-hidden">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-20">
                    <h2 className="text-5xl md:text-7xl font-black headline-skew mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-off-white/70">
                        Our Products
                    </h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        A showcase of excellence. We build scalable, agentic, and beautiful software that powers businesses.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {productsData.map((product, index) => (
                        <article 
                            key={index}
                            onClick={() => handleProductClick(product)}
                            className={`group relative bg-neutral-900 border-2 border-white/20 p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 ${product.border} ${product.glow} flex flex-col cursor-pointer`}
                        >
                            {/* Top Icon & Title */}
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-16 h-16 rounded-xl bg-brand-black border border-white/10 flex items-center justify-center text-3xl ${product.accent} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                    <i className={product.icon}></i>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-white group-hover:text-brand-black">
                                    <i className="fas fa-arrow-right -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-wide mb-2">{product.title}</h3>
                            <h4 className={`text-sm font-mono font-bold uppercase tracking-wider mb-4 ${product.accent} opacity-80`}>{product.subtitle}</h4>
                            <p className="text-white/60 leading-relaxed mb-6 flex-grow">{product.description}</p>
                            
                            {/* Visual cue to click */}
                            <div className="mb-4 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity text-white/80">
                                Click to view details <i className="fas fa-external-link-alt ml-1"></i>
                            </div>

                            {/* Links Footer */}
                            {product.links && (
                                <div className="mt-auto pt-6 border-t border-white/10 flex gap-4 relative z-10" onClick={(e) => e.stopPropagation()}>
                                    {Object.entries(product.links).map(([key, url]) => {
                                        let iconClass = '';
                                        let label = '';
                                        if (key === 'ios') { iconClass = 'fab fa-app-store-ios'; label = 'Download on iOS'; }
                                        else if (key === 'android') { iconClass = 'fab fa-google-play'; label = 'Download on Android'; }
                                        else if (key === 'webApp') { iconClass = 'fas fa-laptop'; label = 'Open Web App'; }
                                        else if (key === 'website') { iconClass = 'fas fa-globe'; label = 'Visit Website'; }
                                        
                                        return (
                                            <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${product.title} - ${label}`} className="text-white/40 hover:text-white transition-colors text-xl p-2 hover:bg-white/10 rounded-full" title={label}>
                                                <i className={iconClass}></i>
                                            </a>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Decorative blurred background blob */}
                            <div className={`absolute -bottom-4 -right-4 w-32 h-32 bg-current opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700 pointer-events-none ${product.accent.replace('text-', 'bg-')}`}></div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PhilosophySection: React.FC = () => (
    <section id="philosophy" className="py-20 px-6 bg-brand-pink bg-grid dark:bg-gray-800">
         <div className="container mx-auto max-w-5xl">
             <h2 className="text-5xl md:text-7xl font-black text-center mb-16 headline-skew text-brand-black dark:text-white">Our Philosophy</h2>
             <div className="relative flex flex-col items-center gap-8">
                {philosophyData.map((item, index) => (
                     <div key={index} className="flex items-center gap-8 w-full">
                        <div className="relative z-10 w-24 h-24 rounded-full bg-brand-purple text-white flex-shrink-0 flex items-center justify-center border-4 border-brand-black dark:border-white sticker-card">
                            <i className={`${item.icon} text-3xl`}></i>
                        </div>
                        <div className="bg-white dark:bg-gray-900 sticker-card sticker-hover p-6 rounded-2xl w-full">
                             <h3 className="text-3xl font-bold dark:text-white">{item.title}</h3>
                            <p className="mt-1 text-brand-black/70 dark:text-gray-300">{item.description}</p>
                        </div>
                     </div>
                ))}
             </div>
         </div>
    </section>
);

const TeamSection: React.FC = () => (
    <section id="team" className="py-24 px-6 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
                <h2 className="text-5xl md:text-7xl font-black headline-skew mb-4 dark:text-white">Our Team</h2>
                <p className="text-lg text-brand-black/60 dark:text-gray-400">Friendly faces, expert minds. We're easy to work with.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {teamData.map((member, index) => (
                    <div key={index} className="flex flex-col items-center text-center group">
                        {/* Avatar Container */}
                        <div className="relative mb-6 cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:-rotate-3">
                            <div className={`w-40 h-40 rounded-full ${member.color} flex items-center justify-center border-4 border-brand-black dark:border-white shadow-[6px_6px_0px_#1A1A1A] dark:shadow-[3px_3px_0px_#FFFFFF] group-hover:shadow-[3px_3px_0px_#1A1A1A] dark:group-hover:shadow-[1px_1px_0px_#FFFFFF] transition-all duration-200`}>
                                <i className={`${member.icon} text-6xl ${member.text}`}></i>
                            </div>
                             {/* Decorative spark */}
                            <div className="absolute -top-2 -right-2 text-3xl text-brand-yellow opacity-0 group-hover:opacity-100 animate-bounce delay-75">✨</div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-brand-black dark:text-white mb-1">{member.name}</h3>
                        <p className="text-xs font-bold uppercase tracking-widest text-brand-black/50 dark:text-gray-500 mb-3">{member.role}</p>
                        
                        {member.linkedin && (
                            <a 
                                href={typeof member.linkedin === 'string' ? member.linkedin : "#"} 
                                target={typeof member.linkedin === 'string' ? "_blank" : ""} 
                                rel="noopener noreferrer" 
                                aria-label={`${member.name}'s LinkedIn Profile`}
                                className="text-brand-purple dark:text-brand-yellow text-2xl hover:scale-125 transition-transform"
                            >
                                <i className="fab fa-linkedin"></i>
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const ProcessSection: React.FC = () => (
    <section id="process" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl md:text-7xl font-black text-center mb-16 headline-skew dark:text-white">Our Process</h2>
            <div className="flex flex-col gap-12">
                {processData.map((phaseData, index) => (
                    <div key={index}>
                        <h3 className="text-3xl font-bold mb-8 text-center md:text-left dark:text-white">{phaseData.phase}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {phaseData.steps.map((step, stepIndex) => (
                                <div key={stepIndex} className="flex items-center gap-4 p-4 rounded-full bg-white dark:bg-gray-800 border-2 border-brand-black dark:border-white sticker-card sticker-hover">
                                    <div className="w-12 h-12 bg-brand-lime rounded-full flex-shrink-0 flex items-center justify-center">
                                        <i className={`${step.icon} text-xl text-brand-black`}></i>
                                    </div>
                                    <span className="font-semibold text-lg dark:text-white">{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);


const FaqItem: React.FC<{ faq: { question: string, answer: string }, isOpen: boolean, onToggle: () => void }> = ({ faq, isOpen, onToggle }) => {
    const answerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (answerRef.current) {
            answerRef.current.style.maxHeight = isOpen ? `${answerRef.current.scrollHeight}px` : '0px';
        }
    }, [isOpen]);

    return (
        <div className="border-b-2 border-brand-purple/20 last:border-b-0 py-4 cursor-pointer" onClick={onToggle} aria-expanded={isOpen}>
            <div className="flex justify-between items-center gap-4">
                <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                <div className="faq-icon text-2xl text-brand-yellow transform transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}>
                   <i className="fas fa-plus"></i>
                </div>
            </div>
            <div ref={answerRef} className="faq-answer" aria-hidden={!isOpen}>
                <p className="pt-4 text-white/70" dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
            </div>
        </div>
    );
};

const FaqSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faqs" className="py-24 px-6 bg-wavy">
            <div className="container mx-auto max-w-4xl relative">
                 <div className="absolute -top-12 -left-12 w-32 h-32 text-8xl opacity-20">🤔</div>
                 <div className="absolute -bottom-12 -right-12 w-32 h-32 text-8xl opacity-20 rotate-12">💡</div>
                 
                 {/* Removed sticker-card class to fix contrast issues, applying manual styles */}
                 <div className="relative bg-brand-purple p-8 md:p-12 rounded-2xl border-4 border-brand-black shadow-[6px_6px_0px_#1A1A1A]">
                    <h2 className="text-5xl md:text-7xl font-black text-center mb-8 text-white headline-skew">Any Questions?</h2>
                    {faqData.map((faq, index) => (
                        <FaqItem 
                            key={index} 
                            faq={faq}
                            isOpen={index === openIndex}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                 </div>
            </div>
        </section>
    );
};

const TestimonialsSection: React.FC = () => {
    // Combine and duplicate the data for seamless single-row loop
    const allTestimonials = [...testimonialsData, ...testimonialsData];

    return (
        <section className="py-24 bg-brand-off-white dark:bg-gray-900 overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6 mb-12 text-center">
                <h2 className="text-5xl md:text-7xl font-black headline-skew mb-4 dark:text-white">What People Say</h2>
                <p className="text-lg text-brand-black/60 dark:text-gray-400">Don't just take our word for it.</p>
            </div>

            {/* Single Row - Left to Right */}
            <div className="flex mb-8 overflow-hidden relative">
                <div className="flex animate-infinite-scroll hover:[animation-play-state:paused] space-x-8 px-8 w-max">
                    {allTestimonials.map((t, i) => (
                        <div key={i} className="w-[350px] md:w-[450px] flex-shrink-0 bg-white dark:bg-gray-800 p-6 rounded-2xl border-3 border-brand-black dark:border-white shadow-[6px_6px_0px_#1A1A1A] dark:shadow-[6px_6px_0px_#FFFFFF] flex flex-col">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 ${t.color} rounded-full border-2 border-brand-black dark:border-white flex items-center justify-center text-white font-bold text-xl shadow-[2px_2px_0px_#1A1A1A] dark:shadow-[2px_2px_0px_#FFFFFF]`}>
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm leading-tight dark:text-white">{t.name}</h4>
                                    <p className="text-xs text-brand-black/60 dark:text-gray-400 leading-tight mt-1 line-clamp-2">{t.role}</p>
                                </div>
                            </div>
                            <div className="relative flex-grow">
                                <i className="fas fa-quote-left text-brand-purple/20 dark:text-brand-purple/50 text-4xl absolute -top-2 -left-2"></i>
                                <p className="text-sm relative z-10 pt-2 pl-2 italic font-medium text-brand-black/80 dark:text-gray-300 leading-relaxed">
                                    "{t.text}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const ContactCTA: React.FC<{ onContactClick: () => void }> = ({ onContactClick }) => (
    <section id="contact" className="py-20 px-6 text-center bg-grid">
        <div className="container mx-auto max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-black headline-skew dark:text-white">Have a Project?</h2>
            <p className="mt-4 mb-8 text-lg text-brand-black/70 dark:text-gray-300">Let's build something amazing together. Reach out and we'll get back to you within 24 hours.</p>
            <button onClick={onContactClick} className="inline-block bg-brand-purple text-white px-8 py-4 rounded-xl font-bold border-2 border-brand-black dark:border-white text-xl sticker-card sticker-hover">
                Get In Touch
            </button>
        </div>
    </section>
);

const FooterThreeBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!mountRef.current) return;
        
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#2a263d');
        
        const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        
        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 150; // subtle amount
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);
        
        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.y += 0.0005;
            particlesMesh.rotation.x += 0.0002;
            // Gentle rising effect
            particlesMesh.position.y += 0.001;
            if(particlesMesh.position.y > 2) particlesMesh.position.y = -2;

            renderer.render(scene, camera);
        };
        
        animate();
        
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            if(mountRef.current) mountRef.current.removeChild(renderer.domElement);
            particlesGeometry.dispose();
            material.dispose();
        };
    }, []);
    
    return <div ref={mountRef} className="absolute inset-0 z-0 opacity-50 pointer-events-none" aria-hidden="true" />;
};

const NYCSkyline: React.FC = () => (
    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center opacity-10 pointer-events-none overflow-hidden h-32 space-x-1 md:space-x-2 px-4 z-0" aria-hidden="true">
        {Array.from({length: 50}).map((_, i) => {
            const height = Math.max(20, Math.random() * 100);
            const width = Math.max(10, Math.random() * 40);
            return (
                <div 
                    key={i} 
                    className="bg-white rounded-t-sm" 
                    style={{
                        height: `${height}%`, 
                        width: `${width}px`,
                        opacity: Math.random() * 0.5 + 0.5
                    }} 
                />
            )
        })}
    </div>
);

const Footer: React.FC<{ onOpenTerms: () => void; onOpenPrivacy: () => void; }> = ({ onOpenTerms, onOpenPrivacy }) => {
    const footerLinks = [
        { icon: 'fab fa-whatsapp', href: 'https://wa.me/16468834335', label: 'WhatsApp' },
        { icon: 'fab fa-x-twitter', href: 'https://x.com/geekingoutnet', label: 'X (Twitter)' },
        { icon: 'fab fa-facebook', href: 'https://www.facebook.com/geekingout', label: 'Facebook' },
        { icon: 'fab fa-instagram', href: 'https://www.instagram.com/geekingoutnet/', label: 'Instagram' },
        { icon: 'fab fa-github', href: 'https://github.com/geekingout/', label: 'GitHub' },
        { icon: 'fab fa-linkedin', href: 'https://www.linkedin.com/company/geeking-out', label: 'LinkedIn' },
        { icon: 'fab fa-discord', href: 'https://discord.gg/qBzwhed3PB', label: 'Discord' },
        { icon: 'fab fa-paypal', href: 'https://www.paypal.me/geekingout', label: 'PayPal' },
        { icon: 'fab fa-youtube', href: 'https://www.youtube.com/channel/UCf3hpUGNU7ZFwTp6KW5L7dQ', label: 'YouTube' },
    ];

    const contactInfo = [
        { icon: 'fas fa-map-marker-alt', text: 'New York City', href: null },
        { icon: 'fas fa-globe', text: 'GEEKINGOUT.NET', href: null }, // Removed href as per request
        { icon: 'fas fa-envelope', text: 'geek@geekingout.net', href: 'mailto:geek@geekingout.net' },
        { icon: 'fas fa-phone', text: '646-883-4335 (GEEK)', href: 'tel:+16468834335' },
        { icon: 'fab fa-whatsapp', text: 'Whatsapp: 646.883.4335', href: 'https://wa.me/16468834335', target: '_blank' },
    ];

    return (
        <footer className="relative bg-[#2a263d] text-white overflow-hidden pt-24 pb-8 mb-20 md:mb-0">
            <FooterThreeBackground />
            
            <div className="container mx-auto max-w-6xl px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                    
                    {/* Left Column: Contact Info */}
                    <div className="flex flex-col justify-center space-y-6">
                         <div className="mb-4">
                            <h3 className="text-3xl font-black tracking-tighter mb-2">Geeking Out</h3>
                            <div className="h-1 w-20 bg-brand-yellow rounded"></div>
                         </div>
                         {contactInfo.map((item, index) => (
                             <div key={index} className="flex items-center gap-4 group">
                                 <div className="w-10 text-center">
                                    <i className={`${item.icon} text-2xl text-white/80 group-hover:text-brand-yellow transition-colors`}></i>
                                 </div>
                                 {item.href ? (
                                     <a href={item.href} target={item.target || undefined} rel={item.target ? "noopener noreferrer" : undefined} className="text-lg font-light tracking-wide hover:text-brand-yellow transition-colors">{item.text}</a>
                                 ) : (
                                     <span className="text-lg font-light tracking-wide">{item.text}</span>
                                 )}
                             </div>
                         ))}
                    </div>

                    {/* Right Column: Social Grid */}
                    <div className="flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-8 md:text-center text-white/90">Connect With Us</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-3 gap-6 max-w-md mx-auto md:mx-0 md:self-center">
                            {footerLinks.map((link, index) => (
                                <a 
                                    key={index} 
                                    href={link.href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                    className="w-16 h-16 rounded-full bg-white text-[#2a263d] flex items-center justify-center text-3xl hover:bg-brand-yellow hover:scale-110 transition-all duration-300 shadow-lg"
                                >
                                    <i className={link.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/40 font-light tracking-wider gap-4">
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <span className="text-brand-red animate-pulse">♥</span>
                        <span>in NYC</span>
                    </div>
                    <div className="text-center md:text-right">
                        <span>© Copyright Geeking Out, LLC</span>
                    </div>
                    <div className="flex gap-6">
                        <button onClick={onOpenTerms} className="hover:text-white transition-colors cursor-pointer">Terms of Service</button>
                        <button onClick={onOpenPrivacy} className="hover:text-white transition-colors cursor-pointer">Privacy</button>
                    </div>
                </div>
            </div>

            <NYCSkyline />
        </footer>
    );
};

const AgentModal: React.FC<{ onClose: () => void; initialDescription?: string }> = ({ onClose, initialDescription = '' }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        organization: '',
        projectDescription: initialDescription
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'sending') return;

        setStatus('sending');
        const ok = await sendToGoogleSheets({
            source: 'Contact Form',
            ...formData
        });
        setStatus(ok ? 'sent' : 'error');
    };

    if (status === 'sent') {
        return (
            <div className="fixed inset-0 bg-brand-black/60 z-[999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                <div className="relative bg-white dark:bg-gray-800 sticker-card p-8 rounded-2xl w-full max-w-lg text-center animate-scale-in" onClick={(e) => e.stopPropagation()}>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold mb-2 dark:text-white">You're all set!</h2>
                    <p className="text-brand-black/60 dark:text-gray-300 mb-6">
                        Thanks {formData.name.split(' ')[0] || 'for reaching out'} — we've got your project details and we'll be in touch shortly.
                    </p>
                    <button onClick={onClose} className="w-full bg-brand-lime text-brand-black px-8 py-4 rounded-xl font-bold border-2 border-brand-black dark:border-white text-lg sticker-card sticker-hover">
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-brand-black/60 z-[999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-gray-800 sticker-card p-8 rounded-2xl w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close Modal" className="absolute top-4 right-4 text-3xl text-brand-black/40 dark:text-white/40 hover:text-brand-red transition-colors">
                    <i className="fas fa-times-circle"></i>
                </button>
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2 text-brand-purple"><i className="fas fa-magic-wand-sparkles"></i></div>
                    <h2 className="text-3xl font-bold dark:text-white">Start Your Project</h2>
                    <p className="text-brand-black/60 dark:text-gray-300">Describe your idea, and we'll get in touch.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block font-semibold mb-1 text-left dark:text-white">Name</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border-2 border-brand-black dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block font-semibold mb-1 text-left dark:text-white">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 border-2 border-brand-black dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                     <div>
                        <label htmlFor="organization" className="block font-semibold mb-1 text-left dark:text-white">Organization</label>
                        <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} className="w-full p-3 border-2 border-brand-black dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple bg-white dark:bg-gray-700 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="projectDescription" className="block font-semibold mb-1 text-left dark:text-white">Describe your Project</label>
                        <textarea id="projectDescription" name="projectDescription" placeholder="e.g., I want to build an AI chatbot for my e-commerce site..." value={formData.projectDescription} onChange={handleChange} required rows={4} className="w-full p-3 border-2 border-brand-black dark:border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple resize-y bg-white dark:bg-gray-700 dark:text-white"></textarea>
                    </div>
                    {status === 'error' && (
                        <p role="alert" className="text-brand-red font-semibold text-sm text-left">
                            <i className="fas fa-triangle-exclamation mr-2"></i>
                            Something went wrong sending that. Check your connection and try again, or email us at <a href="mailto:hello@geekingout.net" className="underline">hello@geekingout.net</a>.
                        </p>
                    )}
                    <button type="submit" disabled={status === 'sending'} className="w-full bg-brand-purple text-white px-8 py-4 rounded-xl font-bold border-2 border-brand-black dark:border-white text-lg sticker-card sticker-hover disabled:opacity-60 disabled:cursor-not-allowed">
                        {status === 'sending' ? 'Sending…' : 'Launch Project'}
                    </button>
                </form>
            </div>
        </div>
    );
};

type Service = {
    icon: string;
    title: string;
    description: string;
    color: string;
    graphic: string;
    explanation: string;
};

const ServiceModal: React.FC<{ service: Service; onClose: () => void; onDiscuss: () => void; }> = ({ service, onClose, onDiscuss }) => {
    return (
        <div className="fixed inset-0 bg-brand-black/60 z-[999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-gray-800 sticker-card p-8 rounded-2xl w-full max-w-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close Modal" className="absolute top-4 right-4 text-3xl text-brand-black/40 dark:text-white/40 hover:text-brand-red transition-colors">
                    <i className="fas fa-times-circle"></i>
                </button>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6 text-center md:text-left">
                    <div className={`w-20 h-20 ${service.color} rounded-lg flex-shrink-0 flex items-center justify-center text-white text-4xl`}>
                        <i className={service.graphic}></i>
                    </div>
                    <div>
                        <h2 className="text-4xl font-bold dark:text-white">{service.title}</h2>
                        <p className="text-brand-black/60 dark:text-gray-300 text-lg">{service.description}</p>
                    </div>
                </div>
                <div className="space-y-4 text-brand-black/80 dark:text-gray-300 text-lg mb-8">
                   <p>{service.explanation}</p>
                </div>
                 <button onClick={onDiscuss} className="w-full bg-brand-lime text-brand-black px-8 py-4 rounded-xl font-bold border-2 border-brand-black dark:border-white text-lg sticker-card sticker-hover">
                    Discuss This Service
                </button>
            </div>
        </div>
    );
};

const LegalModal: React.FC<{ title: string; content: string; onClose: () => void }> = ({ title, content, onClose }) => {
    return (
        <div className="fixed inset-0 bg-brand-black/60 z-[999] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-gray-800 sticker-card p-8 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} aria-label="Close Modal" className="absolute top-4 right-4 text-3xl text-brand-black/40 dark:text-white/40 hover:text-brand-red transition-colors">
                    <i className="fas fa-times-circle"></i>
                </button>
                <div className="mb-6">
                    <h2 className="text-3xl font-bold border-b-4 border-brand-purple inline-block pb-1 dark:text-white">{title}</h2>
                </div>
                <div className="flex-grow overflow-y-auto pr-4 text-brand-black/80 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-light">
                    {content}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button onClick={onClose} className="bg-brand-black dark:bg-white text-white dark:text-brand-black px-6 py-2 rounded-lg font-bold hover:bg-brand-purple dark:hover:bg-brand-yellow transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main App Component ---

function App() {
     const [isMenuOpen, setIsMenuOpen] = useState(false);
     const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
     const [selectedService, setSelectedService] = useState<Service | null>(null);
     const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
     const [isDark, setIsDark] = useState(false);

     // Text piped into the contact form's project field (from the hero input or a service modal)
     const [projectPrefill, setProjectPrefill] = useState('');

     // Theme toggle handler
     const toggleTheme = () => {
         if (document.documentElement.classList.contains('dark')) {
             document.documentElement.classList.remove('dark');
             localStorage.theme = 'light';
             setIsDark(false);
         } else {
             document.documentElement.classList.add('dark');
             localStorage.theme = 'dark';
             setIsDark(true);
         }
     };

     useEffect(() => {
         // Sync state with DOM on mount
         setIsDark(document.documentElement.classList.contains('dark'));
     }, []);

     const handleServiceClick = (service: Service) => {
        setSelectedService(service);
     };

     const handleCloseServiceModal = () => {
        setSelectedService(null);
     };
     
     const handleDiscussService = () => {
        if (selectedService) setProjectPrefill(`I'd like to talk about ${selectedService.title}. `);
        setSelectedService(null);
        setIsAgentModalOpen(true);
     }

     const handleHeroSubmit = (msg: string) => {
        setProjectPrefill(msg);
        setIsAgentModalOpen(true);
     };

     const handleCloseAgentModal = () => {
        setIsAgentModalOpen(false);
        setProjectPrefill('');
     };

     const handleOpenAgentModal = () => {
        setProjectPrefill('');
        setIsAgentModalOpen(true);
     };

     useEffect(() => {
        const gsap = (window as any).gsap;
        const ScrollTrigger = (window as any).ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);
        
        // Removed custom cursor logic as requested
        
        // Robust animation context for cleanup
        let ctx = gsap.context(() => {
            // Hero Entrance
            const heroWords = gsap.utils.toArray('[data-hero-word]');
            heroWords.forEach(word => {
                const chars = (word as Element).textContent?.split('');
                (word as Element).innerHTML = '';
                if(chars) {
                    chars.forEach(char => {
                        const span = document.createElement('span');
                        span.textContent = char;
                        span.style.display = 'inline-block';
                        (word as Element).appendChild(span);
                    });
                }
            });
            gsap.from('[data-hero-word] span', {
                y: 100,
                opacity: 0,
                stagger: 0.05,
                duration: 1,
                ease: 'power4.out',
                delay: 0.5
            });
            gsap.from('[data-hero-sub]', { opacity: 0, y: 20, duration: 1, delay: 1.2, stagger: 0.2 });
            
            // Floating & Parallax AI Agents
            gsap.utils.toArray('[data-sticker]').forEach((sticker: any) => {
                // Continuous Floating Animation
                gsap.to(sticker, {
                    x: gsap.utils.random(-25, 25, 1),
                    y: gsap.utils.random(-25, 25, 1),
                    rotation: gsap.utils.random(-10, 10, 1),
                    ease: 'sine.inOut',
                    duration: gsap.utils.random(4, 6),
                    repeat: -1,
                    yoyo: true
                });

                // Parallax on Scroll
                const speed = sticker.dataset.speed || 1;
                gsap.to(sticker, {
                    y: (i: any, target: any) => ScrollTrigger.maxScroll(window) * 0.15 * parseFloat(speed as string),
                    ease: 'none',
                    scrollTrigger: {
                        scrub: 0.75,
                    }
                });
            });

            // Section Animations on Scroll
            const sections = gsap.utils.toArray('section, footer');
            sections.forEach((section: any) => {
                gsap.from(section, {
                    opacity: 0,
                    y: 50,
                    skewY: 3,
                    duration: 1,
                    ease: 'power4.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    }
                });
            });
        });

        // Cleanup function
        return () => ctx.revert();
    }, []);


    return (
        <>
            <Header
                onContactClick={handleOpenAgentModal}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                toggleTheme={toggleTheme}
                isDark={isDark}
            />
            <main>
                <HeroSection onSubmit={handleHeroSubmit} />
                <ScrollingTicker />
                <ServicesSection onServiceClick={handleServiceClick} />
                <ProductsSection />
                <PhilosophySection />
                <TeamSection />
                <ProcessSection />
                <FaqSection />
                <TestimonialsSection />
            </main>
            <ContactCTA onContactClick={handleOpenAgentModal} />
            <Footer
                onOpenTerms={() => setLegalModal('terms')}
                onOpenPrivacy={() => setLegalModal('privacy')}
            />
            {isAgentModalOpen && <AgentModal onClose={handleCloseAgentModal} initialDescription={projectPrefill} />}
            {selectedService && <ServiceModal service={selectedService} onClose={handleCloseServiceModal} onDiscuss={handleDiscussService} />}
            
            {legalModal === 'terms' && (
                <LegalModal 
                    title="Terms of Service" 
                    content={termsContent} 
                    onClose={() => setLegalModal(null)} 
                />
            )}
            {legalModal === 'privacy' && (
                <LegalModal 
                    title="Privacy Policy" 
                    content={privacyContent} 
                    onClose={() => setLegalModal(null)} 
                />
            )}
            <MobileNavBar
                onContactClick={handleOpenAgentModal}
                isMenuOpen={isMenuOpen}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
            />
        </>
    );
}

export default App;
