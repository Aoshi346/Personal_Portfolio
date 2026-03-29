import { useLayoutEffect, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, Linkedin, ChevronRight } from "lucide-react";
import { Language, translations } from "../../constants/translations";

gsap.registerPlugin(ScrollTrigger);

// ─── Shared path data ─────────────────────────────────────────────────────────
const HELLO_PATHS = [
  "M95.04 68.832C95.872 68.832 96.512 69.216 96.96 69.984C97.472 70.752 97.728 71.808 97.728 73.152C97.728 75.648 97.12 77.632 95.904 79.104C89.568 86.848 82.816 90.72 75.648 90.72C69.44 90.72 64.48 88.32 60.768 83.52C57.056 78.72 55.2 71.84 55.2 62.88C55.2 60.704 55.296 58.528 55.488 56.352C51.264 57.12 46.656 57.696 41.664 58.08C38.336 58.336 36.064 58.496 34.848 58.56C33.568 65.088 31.776 73.088 29.472 82.56C28.128 88.128 25.568 90.912 21.792 90.912C17.696 90.912 15.648 89.056 15.648 85.344C15.648 84.512 15.808 83.36 16.128 81.888C18.304 73.12 20.032 65.696 21.312 59.616L16.704 59.808C14.592 59.808 13.056 59.456 12.096 58.752C11.136 57.984 10.656 56.768 10.656 55.104C10.656 52.992 11.264 51.456 12.48 50.496C13.696 49.472 15.712 48.896 18.528 48.768L23.616 48.576C25.28 39.552 26.112 32.672 26.112 27.936C26.112 24.928 25.664 22.88 24.768 21.792C23.872 20.704 22.688 20.16 21.216 20.16C16.736 20.16 11.68 23.904 6.048 31.392C5.216 32.48 4.288 33.024 3.264 33.024C2.368 33.024 1.6 32.608 0.96 31.776C0.32 30.944 0 29.888 0 28.608C0 26.624 0.8 24.512 2.4 22.272C5.216 18.368 8.768 15.168 13.056 12.672C17.344 10.112 21.696 8.832 26.112 8.832C30.272 8.832 33.472 10.272 35.712 13.152C38.016 15.968 39.168 20.384 39.168 26.4C39.168 31.712 38.4 38.912 36.864 48L46.272 47.52C50.304 47.328 53.76 47.008 56.64 46.56C57.792 39.52 59.552 32.928 61.92 26.784C64.288 20.64 67.232 15.648 70.752 11.808C74.272 7.968 78.208 6.048 82.56 6.048C85.76 6.048 88.288 7.328 90.144 9.888C92 12.384 92.928 15.68 92.928 19.776C92.928 35.648 84.832 46.656 68.64 52.8C68.448 55.36 68.352 58.016 68.352 60.768C68.352 67.488 69.184 72.256 70.848 75.072C72.512 77.888 74.848 79.296 77.856 79.296C80.48 79.296 82.88 78.624 85.056 77.28C87.232 75.872 89.696 73.504 92.448 70.176C93.216 69.28 94.08 68.832 95.04 68.832ZM82.08 14.4C80.672 14.4 79.168 15.68 77.568 18.24C76.032 20.8 74.56 24.288 73.152 28.704C71.744 33.12 70.624 37.952 69.792 43.2C74.912 41.088 78.688 38.08 81.12 34.176C83.552 30.272 84.768 25.248 84.768 19.104C84.768 17.632 84.512 16.48 84 15.648C83.488 14.816 82.848 14.4 82.08 14.4Z",
  "M145.241 68.832C146.073 68.832 146.713 69.216 147.161 69.984C147.673 70.752 147.929 71.808 147.929 73.152C147.929 75.712 147.321 77.696 146.105 79.104C143.737 81.984 140.377 84.64 136.025 87.072C131.737 89.504 127.129 90.72 122.201 90.72C115.481 90.72 110.265 88.896 106.553 85.248C102.841 81.6 100.985 76.608 100.985 70.272C100.985 65.856 101.913 61.76 103.769 57.984C105.625 54.144 108.185 51.104 111.449 48.864C114.777 46.624 118.521 45.504 122.681 45.504C126.393 45.504 129.369 46.624 131.609 48.864C133.849 51.04 134.969 54.016 134.969 57.792C134.969 62.208 133.369 66.016 130.169 69.216C127.033 72.352 121.689 74.848 114.137 76.704C115.737 79.648 118.777 81.12 123.257 81.12C126.137 81.12 129.401 80.128 133.049 78.144C136.761 76.096 139.961 73.44 142.649 70.176C143.417 69.28 144.281 68.832 145.241 68.832ZM121.049 54.912C118.681 54.912 116.665 56.288 115.001 59.04C113.401 61.792 112.601 65.12 112.601 69.024V69.216C116.377 68.32 119.353 66.976 121.529 65.184C123.705 63.392 124.793 61.312 124.793 58.944C124.793 57.728 124.441 56.768 123.737 56.064C123.097 55.296 122.201 54.912 121.049 54.912Z",
  "M176.497 68.832C177.329 68.832 177.969 69.216 178.417 69.984C178.929 70.752 179.185 71.808 179.185 73.152C179.185 75.712 178.577 77.696 177.361 79.104C174.609 82.496 171.601 85.28 168.337 87.456C165.137 89.632 161.489 90.72 157.393 90.72C151.761 90.72 147.569 88.16 144.817 83.04C142.129 77.92 140.785 71.296 140.785 63.168C140.785 55.36 141.777 46.464 143.761 36.48C145.809 26.496 148.785 17.92 152.689 10.752C156.657 3.584 161.361 0 166.801 0C169.873 0 172.273 1.44 174.001 4.32C175.793 7.136 176.689 11.2 176.689 16.512C176.689 24.128 174.577 32.96 170.353 43.008C166.129 53.056 160.401 63.008 153.169 72.864C153.617 75.488 154.353 77.376 155.377 78.528C156.401 79.616 157.745 80.16 159.409 80.16C162.033 80.16 164.337 79.424 166.321 77.952C168.305 76.416 170.833 73.824 173.905 70.176C174.673 69.28 175.537 68.832 176.497 68.832ZM164.689 9.50401C163.217 9.50401 161.553 12.16 159.697 17.472C157.841 22.784 156.209 29.376 154.801 37.248C153.393 45.12 152.625 52.672 152.497 59.904C157.041 52.416 160.657 44.928 163.345 37.44C166.033 29.888 167.377 23.008 167.377 16.8C167.377 11.936 166.481 9.50401 164.689 9.50401Z",
  "M207.809 68.832C208.641 68.832 209.281 69.216 209.729 69.984C210.241 70.752 210.497 71.808 210.497 73.152C210.497 75.712 209.889 77.696 208.673 79.104C205.921 82.496 202.913 85.28 199.649 87.456C196.449 89.632 192.801 90.72 188.705 90.72C183.073 90.72 178.881 88.16 176.129 83.04C173.441 77.92 172.097 71.296 172.097 63.168C172.097 55.36 173.089 46.464 175.073 36.48C177.121 26.496 180.097 17.92 184.001 10.752C187.969 3.584 192.673 0 198.113 0C201.185 0 203.585 1.44 205.313 4.32C207.105 7.136 208.001 11.2 208.001 16.512C208.001 24.128 205.889 32.96 201.665 43.008C197.441 53.056 191.713 63.008 184.481 72.864C184.929 75.488 185.665 77.376 186.689 78.528C187.713 79.616 189.057 80.16 190.721 80.16C193.345 80.16 195.649 79.424 197.633 77.952C199.617 76.416 202.145 73.824 205.217 70.176C205.985 69.28 206.849 68.832 207.809 68.832ZM196.001 9.50401C194.529 9.50401 192.865 12.16 191.009 17.472C189.153 22.784 187.521 29.376 186.113 37.248C184.705 45.12 183.937 52.672 183.809 59.904C188.353 52.416 191.969 44.928 194.657 37.44C197.345 29.888 198.689 23.008 198.689 16.8C198.689 11.936 197.793 9.50401 196.001 9.50401Z",
  "M218.962 90.72C215.186 90.72 211.954 89.792 209.266 87.936C206.642 86.016 204.658 83.52 203.314 80.448C201.97 77.376 201.298 74.08 201.298 70.56C201.298 65.696 202.194 61.376 203.986 57.6C205.842 53.76 208.338 50.784 211.474 48.672C214.61 46.496 218.13 45.408 222.034 45.408C225.81 45.408 229.042 46.368 231.73 48.288C234.418 50.144 236.434 52.608 237.778 55.68C239.122 58.752 239.794 62.048 239.794 65.568C239.794 70.432 238.866 74.784 237.01 78.624C235.154 82.4 232.626 85.376 229.426 87.552C226.29 89.664 222.802 90.72 218.962 90.72ZM220.018 80.352C222.194 80.352 224.018 79.168 225.49 76.8C227.026 74.432 227.794 70.976 227.794 66.432C227.794 62.912 227.154 60.256 225.874 58.464C224.594 56.672 223.058 55.776 221.266 55.776C218.962 55.776 217.042 56.96 215.506 59.328C214.034 61.632 213.298 65.088 213.298 69.696C213.298 73.344 213.938 76.032 215.218 77.76C216.498 79.488 218.098 80.352 220.018 80.352Z",
  "M393.564 48.768C395.036 48.768 396.092 49.088 396.732 49.728C397.436 50.368 397.788 51.2 397.788 52.224C397.788 53.888 397.276 55.36 396.252 56.64C395.292 57.92 393.756 58.592 391.644 58.656C386.588 58.72 382.044 58.336 378.012 57.504C373.532 67.04 368.124 74.976 361.788 81.312C355.516 87.584 349.308 90.72 343.164 90.72C337.532 90.72 333.308 87.744 330.492 81.792C327.676 75.776 326.076 67.744 325.692 57.696C321.852 68.832 317.5 77.12 312.636 82.56C307.836 88 302.716 90.72 297.276 90.72C291.132 90.72 286.492 86.912 283.356 79.296C280.22 71.616 278.652 61.312 278.652 48.384C278.652 38.976 279.484 28.64 281.148 17.376C281.596 14.176 282.396 11.968 283.548 10.752C284.764 9.472 286.652 8.832 289.212 8.832C291.132 8.832 292.604 9.248 293.628 10.08C294.716 10.912 295.26 12.448 295.26 14.688C295.26 15.136 295.196 16 295.068 17.28C293.148 30.4 292.188 41.568 292.188 50.784C292.188 59.36 292.924 65.984 294.396 70.656C295.868 75.328 297.852 77.664 300.348 77.664C302.588 77.664 305.276 75.328 308.412 70.656C311.612 65.92 314.78 58.944 317.916 49.728C321.052 40.448 323.708 29.408 325.884 16.608C326.396 13.664 327.324 11.648 328.668 10.56C330.076 9.408 331.964 8.832 334.332 8.832C336.316 8.832 337.756 9.28 338.652 10.176C339.612 11.008 340.092 12.288 340.092 14.016C340.092 15.04 340.028 15.84 339.9 16.416C338.108 26.848 337.212 37.28 337.212 47.712C337.212 54.816 337.436 60.48 337.884 64.704C338.396 68.928 339.324 72.16 340.668 74.4C342.076 76.576 344.092 77.664 346.716 77.664C349.788 77.664 353.212 75.36 356.988 70.752C360.764 66.08 364.22 60.288 367.356 53.376C363.452 50.944 360.508 47.808 358.524 43.968C356.54 40.064 355.548 35.584 355.548 30.528C355.548 25.472 356.316 21.216 357.852 17.76C359.452 14.24 361.596 11.616 364.284 9.888C367.036 8.16 370.076 7.29601 373.404 7.29601C377.5 7.29601 380.732 8.76801 383.1 11.712C385.532 14.656 386.748 18.688 386.748 23.808C386.748 31.04 385.18 39.072 382.044 47.904C385.308 48.48 389.148 48.768 393.564 48.768ZM365.244 29.856C365.244 36.128 367.26 40.768 371.292 43.776C373.788 36.608 375.036 30.688 375.036 26.016C375.036 23.328 374.684 21.376 373.98 20.16C373.276 18.88 372.316 18.24 371.1 18.24C369.372 18.24 367.964 19.264 366.876 21.312C365.788 23.296 365.244 26.144 365.244 29.856Z",
  "M437.417 60.768C438.249 60.768 438.889 61.184 439.337 62.016C439.785 62.848 440.009 63.904 440.009 65.184C440.009 68.256 439.081 70.08 437.225 70.656C433.385 72 429.161 72.768 424.553 72.96C423.337 78.336 420.937 82.656 417.353 85.92C413.769 89.12 409.705 90.72 405.161 90.72C401.321 90.72 398.025 89.792 395.273 87.936C392.585 86.08 390.537 83.616 389.129 80.544C387.721 77.472 387.017 74.144 387.017 70.56C387.017 65.696 387.945 61.376 389.801 57.6C391.657 53.76 394.216 50.784 397.48 48.672C400.744 46.496 404.361 45.408 408.329 45.408C413.193 45.408 417.096 47.104 420.04 50.496C423.048 53.824 424.809 57.952 425.321 62.88C428.329 62.688 431.913 62.048 436.073 60.96C436.585 60.832 437.033 60.768 437.417 60.768ZM405.928 80.544C407.976 80.544 409.737 79.712 411.209 78.048C412.745 76.384 413.769 73.984 414.281 70.848C412.297 69.504 410.761 67.744 409.673 65.568C408.649 63.392 408.137 61.088 408.137 58.656C408.137 57.632 408.233 56.608 408.424 55.584H407.945C405.385 55.584 403.241 56.832 401.513 59.328C399.849 61.76 399.017 65.216 399.017 69.696C399.017 73.216 399.689 75.904 401.033 77.76C402.441 79.616 404.072 80.544 405.928 80.544Z",
  "M438.585 90.72C436.153 90.72 434.425 89.44 433.401 86.88C432.441 84.32 431.961 80.224 431.961 74.592C431.961 66.272 433.145 58.368 435.513 50.88C436.089 49.024 437.017 47.68 438.297 46.848C439.641 45.952 441.497 45.504 443.865 45.504C445.145 45.504 446.041 45.664 446.553 45.984C447.065 46.304 447.321 46.912 447.321 47.808C447.321 48.832 446.841 51.136 445.881 54.72C445.241 57.28 444.729 59.52 444.345 61.44C443.961 63.36 443.641 65.728 443.385 68.544C445.497 63.04 447.865 58.56 450.489 55.104C453.113 51.648 455.673 49.184 458.169 47.712C460.729 46.24 463.065 45.504 465.177 45.504C469.337 45.504 471.417 47.584 471.417 51.744C471.417 52.576 471.129 54.592 470.553 57.792C470.041 60.352 469.785 61.952 469.785 62.592C469.785 64.832 470.585 65.952 472.185 65.952C473.977 65.952 476.281 64.544 479.097 61.728C479.929 60.896 480.793 60.48 481.689 60.48C482.521 60.48 483.161 60.864 483.609 61.632C484.121 62.336 484.377 63.296 484.377 64.512C484.377 66.88 483.737 68.736 482.457 70.08C480.665 71.936 478.553 73.536 476.121 74.88C473.753 76.16 471.225 76.8 468.537 76.8C465.145 76.8 462.553 75.936 460.761 74.208C459.033 72.48 458.169 70.144 458.169 67.2C458.169 66.24 458.265 65.28 458.457 64.32C458.585 63.04 458.649 62.176 458.649 61.728C458.649 60.704 458.297 60.192 457.593 60.192C456.633 60.192 455.353 61.28 453.753 63.456C452.217 65.568 450.681 68.384 449.145 71.904C447.609 75.424 446.361 79.136 445.401 83.04C444.697 86.048 443.865 88.096 442.905 89.184C442.009 90.208 440.569 90.72 438.585 90.72Z",
  "M511.841 68.832C512.673 68.832 513.312 69.216 513.76 69.984C514.272 70.752 514.529 71.808 514.529 73.152C514.529 75.712 513.92 77.696 512.704 79.104C509.952 82.496 506.945 85.28 503.681 87.456C500.481 89.632 496.833 90.72 492.737 90.72C487.105 90.72 482.913 88.16 480.161 83.04C477.473 77.92 476.129 71.296 476.129 63.168C476.129 55.36 477.121 46.464 479.105 36.48C481.153 26.496 484.129 17.92 488.033 10.752C492.001 3.584 496.705 0 502.145 0C505.217 0 507.617 1.44 509.345 4.32C511.137 7.136 512.033 11.2 512.033 16.512C512.033 24.128 509.921 32.96 505.697 43.008C501.473 53.056 495.745 63.008 488.513 72.864C488.961 75.488 489.697 77.376 490.721 78.528C491.745 79.616 493.089 80.16 494.753 80.16C497.377 80.16 499.681 79.424 501.665 77.952C503.649 76.416 506.177 73.824 509.249 70.176C510.017 69.28 510.881 68.832 511.841 68.832ZM500.033 9.50401C501.825 9.50401 502.721 11.936 502.721 16.8C502.721 23.008 501.377 29.888 498.689 37.44C496.001 44.928 492.385 52.416 487.841 59.904C487.969 52.672 488.737 45.12 490.145 37.248C491.553 29.376 493.184 22.784 495.04 17.472C496.896 12.16 498.561 9.50401 500.033 9.50401Z",
  "M540.776 68.832C541.48 74.08 542.504 79.264 543.848 84.384C544.104 85.216 544.232 86.08 544.232 86.976C544.232 89.856 542.472 91.296 538.952 91.296C536.968 91.296 535.432 90.752 534.344 89.664C533.32 88.576 532.36 86.528 531.464 83.52L531.367 83.136C528.935 86.144 526.728 88.16 524.744 89.184C522.824 90.208 520.583 90.72 518.023 90.72C514.119 90.72 510.888 89.28 508.328 86.4C505.832 83.456 504.583 79.648 504.583 74.976C504.583 69.856 505.672 65.12 507.848 60.768C510.024 56.416 513 52.864 516.776 50.112C520.552 47.296 524.776 45.6 529.448 45.024C530.664 32.928 532.967 22.4 536.359 13.44C539.815 4.48 544.392 0 550.088 0C552.84 0 555.112 1.248 556.904 3.744C558.76 6.24 559.688 10.016 559.688 15.072C559.688 22.112 557.96 30.336 554.504 39.744C551.048 49.152 546.472 58.848 540.776 68.832ZM549.031 9.408C547.175 9.408 545.416 14.144 543.752 23.616C542.152 33.088 541.063 43.392 540.487 54.528C547.591 39.168 551.143 26.688 551.143 17.088C551.143 14.656 550.919 12.768 550.471 11.424C550.087 10.08 549.607 9.408 549.031 9.408ZM521.383 81.024C522.663 81.024 523.879 80.544 525.031 79.584C526.247 78.624 527.784 76.768 529.64 74.016C529 69.344 528.68 64.512 528.68 59.52C528.68 57.536 528.712 56 528.776 54.912C525.256 55.936 522.343 58.272 520.039 61.92C517.735 65.568 516.583 69.6 516.583 74.016C516.583 78.688 518.183 81.024 521.383 81.024Z",
  "M565.802 67.776C564.522 67.776 563.466 67.488 562.634 66.912C561.802 66.336 561.386 65.44 561.386 64.224L561.482 63.456C562.57 56.288 564.042 48.128 565.898 38.976C567.754 29.824 569.482 21.92 571.082 15.264C572.106 11.168 574.89 9.12 579.434 9.12C583.53 9.12 585.578 10.432 585.578 13.056C585.578 13.632 585.482 14.272 585.29 14.976C583.626 21.76 581.418 29.984 578.666 39.648C575.914 49.248 573.29 57.6 570.794 64.704C570.09 66.752 568.426 67.776 565.802 67.776ZM562.154 90.72C559.338 90.72 557.194 89.952 555.722 88.416C554.314 86.88 553.61 84.864 553.61 82.368C553.61 79.488 554.41 77.184 556.01 75.456C557.674 73.728 559.978 72.864 562.922 72.864C565.738 72.864 567.85 73.568 569.258 74.976C570.73 76.32 571.466 78.336 571.466 81.024C571.466 83.968 570.634 86.336 568.97 88.128C567.306 89.856 565.034 90.72 562.154 90.72Z",
];

// ─── Touch detection (avoids costly mouse-move RAF on mobile) ────────────────
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

// ─── Magnetic Icon ────────────────────────────────────────────────────────────
const MagneticIcon = ({
  href, ariaLabel, children,
}: {
  href: string; ariaLabel: string; children: React.ReactNode;
}) => {
  const wrapRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !innerRef.current) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < 42)
      gsap.to(innerRef.current, {
        x: dx * 0.36, y: dy * 0.36, duration: 0.28, ease: "power2.out", overwrite: "auto",
      });
  }, []);

  const onLeave = useCallback(() => {
    gsap.to(innerRef.current, {
      x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)", overwrite: "auto",
    });
  }, []);

  return (
    <a ref={wrapRef} href={href} aria-label={ariaLabel} target="_blank" rel="noopener noreferrer"
      onMouseMove={onMove} onMouseLeave={onLeave} className="p-3 -m-3 group">
      <span ref={innerRef}
        className="flex items-center justify-center text-white/40 group-hover:text-[var(--primary)] transition-colors duration-300">
        {children}
      </span>
    </a>
  );
};

// ─── Hero component ───────────────────────────────────────────────────────────
interface HeroProps {
  language: Language;
  isStarted: boolean;
}

export const Hero = ({ language, isStarted }: HeroProps) => {
  const t = translations[language].hero;

  // ── Refs ──────────────────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<SVGSVGElement>(null);

  // Left column – text
  const textColRef = useRef<HTMLDivElement>(null);
  const nameLineRef = useRef<HTMLSpanElement>(null);
  const roleLine1Ref = useRef<HTMLSpanElement>(null);
  const roleLine2Ref = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  // Right column – signature watermark (the transfer target)
  const sigRef = useRef<HTMLDivElement>(null);
  const sigSvgRef = useRef<SVGSVGElement>(null);

  // HUD
  const hudTRRef = useRef<HTMLDivElement>(null);
  const hudBRRef = useRef<HTMLDivElement>(null);
  const hudBracketTRef = useRef<SVGSVGElement>(null);
  const hudBracketBRef = useRef<SVGSVGElement>(null);

  // ── Phase 0 – FOUC guard ─────────────────────────────────────────────────
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Text lines hidden below their masks
      gsap.set([nameLineRef.current, roleLine1Ref.current, roleLine2Ref.current],
        { yPercent: 110, rotate: 2 });
      gsap.set([tagRef.current, ctaGroupRef.current, scrollHintRef.current],
        { autoAlpha: 0, y: 20 });
      gsap.set(ctaBtnRef.current, { scale: 0.85, autoAlpha: 0 });

      // Atmospheric layers
      gsap.set(glowRef.current, { scale: 0.6, autoAlpha: 0 });
      gsap.set(meshRef.current, { scale: 1.15, autoAlpha: 0, transformOrigin: "center" });

      // Signature: invisible until the preloader SVG "lands"
      gsap.set(sigRef.current, { autoAlpha: 0, scale: 0.88 });

      // Name starts offset toward viewport center (preloader position)
      gsap.set(nameLineRef.current, { y: "26vh", yPercent: 0, rotate: 0 });

      // HUD elements
      gsap.set(
        [hudTRRef.current, hudBRRef.current, hudBracketTRef.current, hudBracketBRef.current],
        { autoAlpha: 0 }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // ── Entrance timeline (fires when isStarted = true) ──────────────────────
  useEffect(() => {
    if (!isStarted) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // ── Atmosphere ──────────────────────────────────────────────────────
      tl.to(meshRef.current, {
        scale: 1, autoAlpha: 1, duration: 0.95, ease: "power3.out",
      }, 0);
      tl.to(glowRef.current, {
        scale: 1, autoAlpha: 1, duration: 1.15, ease: "power2.out",
      }, 0.05);

      // ── Name slides from preloader center → natural position ──────────
      tl.to(nameLineRef.current, { y: 0, duration: 0.88 }, 0.06);

      // ── Role lines lift from below ────────────────────────────────────
      tl.to([roleLine1Ref.current, roleLine2Ref.current], {
        yPercent: 0, rotate: 0, duration: 1.0, stagger: 0.1,
      }, 0.2);

      // ── Tag ───────────────────────────────────────────────────────────
      tl.to(tagRef.current, {
        autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out",
      }, 0.26);

      // ── Signature SVG "lands" — the visual handshake ──────────────────
      // No stroke re-draw needed: the preloader already drew + filled it.
      // We simply reveal the already-filled paths (object permanence).
      tl.to(sigRef.current, {
        autoAlpha: 1, scale: 1, duration: 0.72, ease: "power3.out",
      }, 0.18);

      // ── CTA group ─────────────────────────────────────────────────────
      tl.to(ctaGroupRef.current, {
        autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out",
      }, 0.42);
      tl.to(ctaBtnRef.current, {
        scale: 1, autoAlpha: 1, duration: 0.65, ease: "back.out(1.7)",
      }, 0.48);
      tl.to(scrollHintRef.current, {
        autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out",
      }, 0.62);

      // ── HUD: terminal blink-in via steps(5) ───────────────────────────
      [hudBracketTRef, hudBracketBRef, hudTRRef, hudBRRef].forEach((ref, i) => {
        if (!ref.current) return;
        gsap.to(ref.current, {
          autoAlpha: 1, duration: 0.35, ease: "steps(5)", delay: 0.7 + i * 0.11,
        });
      });

      // ── CTA idle float ────────────────────────────────────────────────
      gsap.to(ctaBtnRef.current, {
        y: -5, duration: 1.9, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2.0,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [isStarted]);

  // ── Scroll orchestration (3-layer parallax + hero exit + HUD lag) ────────
  useLayoutEffect(() => {
    if (!isStarted) return;

    // Tiny delay so GSAP measures post-entrance positions
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // ── Layer 1: Background mesh (slowest — "furthest away") ──────
        gsap.to(meshRef.current, {
          y: "-18%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top", end: "bottom top",
            scrub: 1.4,
          },
        });

        // ── Layer 2: Signature SVG (intermediate speed) ───────────────
        gsap.to(sigRef.current, {
          y: "-10%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top", end: "bottom top",
            scrub: 1.2,
          },
        });

        // ── Layer 3: Text column (fastest — "closest") ────────────────
        gsap.to(textColRef.current, {
          y: "-5%",
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top", end: "bottom top",
            scrub: 1.0,
          },
        });

        // ── Hero exit: fade + scale ───────────────────────────────────
        gsap.to(sectionRef.current, {
          opacity: 0, scale: 0.97,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "center top", end: "bottom top",
            scrub: 0.8,
          },
        });

        // ── SVG de-construct on exit — glow then fade ─────────────────
        const sigPaths = sigSvgRef.current?.querySelectorAll(".hero-sig-path");
        if (sigPaths?.length) {
          gsap.to(sigPaths, {
            opacity: 0.04,
            filter: "drop-shadow(0 0 8px rgba(143,245,255,0.7))",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "35% top", end: "bottom top",
              scrub: 0.6,
            },
          });
        }

        // ── HUD magnetic lag: slight delay as they scroll out ─────────
        [hudTRRef.current, hudBRRef.current,
        hudBracketTRef.current, hudBracketBRef.current].forEach((el) => {
          if (!el) return;
          gsap.to(el, {
            y: "-30%", autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "30% top", end: "65% top",
              scrub: 2.0,   // High scrub = "magnetic lag" — they trail behind
            },
          });
        });

      }, sectionRef);

      // Cleanup needs to be captured by the timer's closure
      const cleanup = () => ctx.revert();
      timerCleanup.current = cleanup;
    }, 100);

    const timerCleanup = { current: null as (() => void) | null };
    return () => {
      clearTimeout(timer);
      timerCleanup.current?.();
    };
  }, [isStarted]);

  // ── Mouse parallax (glow + mesh) — disabled on touch ─────────────────────
  useLayoutEffect(() => {
    if (isTouchDevice()) return;

    let rafId = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    const tick = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (glowRef.current) gsap.set(glowRef.current, { xPercent: cx * 18, yPercent: cy * 12 });
      if (meshRef.current) gsap.set(meshRef.current, { xPercent: cx * -8, yPercent: cy * -5 });
      rafId = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Derived content ──────────────────────────────────────────────────────
  const roleWords = t.role.split(" ");
  const roleLine1 = roleWords[0];
  const roleLine2 = roleWords.slice(1).join(" ");

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      id="section-1"
      aria-label="Hero – Introduction"
      className="relative h-screen flex items-center overflow-hidden bg-transparent"
      style={{ willChange: "transform, opacity" }}
    >
      {/* ── Grain overlay ────────────────────────────────────────────── */}
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.055] grain-layer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px", mixBlendMode: "overlay",
        }}
      />

      {/* ── Ambient glow ─────────────────────────────────────────────── */}
      <div ref={glowRef} aria-hidden="true" className="pointer-events-none absolute z-0"
        style={{
          top: "8%", left: "-8%",
          width: "clamp(520px,68vw,920px)", height: "clamp(420px,58vh,780px)",
          background: "radial-gradient(ellipse at 38% 50%, rgba(143,245,255,0.09) 0%, rgba(191,129,255,0.05) 55%, transparent 75%)",
          filter: "blur(76px)", willChange: "transform, opacity",
        }}
      />

      {/* ── Background mesh (layer 1 — slowest parallax) ─────────────── */}
      <svg ref={meshRef} aria-hidden="true"
        className="pointer-events-none absolute right-[-2%] top-[6%] z-0"
        width="680" height="640" viewBox="0 0 680 640" fill="none"
        style={{ willChange: "transform, opacity", transformOrigin: "center" }}>
        <defs>
          <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.6" />
          </pattern>
          <radialGradient id="hero-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="hero-gridmask">
            <rect width="680" height="640" fill="url(#hero-fade)" />
          </mask>
        </defs>
        <rect width="680" height="640" fill="url(#hero-grid)" mask="url(#hero-gridmask)" opacity="0.04" />
        <circle cx="340" cy="320" r="200" stroke="rgba(143,245,255,0.11)" strokeWidth="0.8" fill="none" />
        <circle cx="340" cy="320" r="280" stroke="rgba(191,129,255,0.06)" strokeWidth="0.6" fill="none" strokeDasharray="4 10" />
        <circle cx="340" cy="320" r="340" stroke="rgba(255,89,227,0.035)" strokeWidth="0.5" fill="none" />
      </svg>

      {/* ── Two-column layout ────────────────────────────────────────── */}
      <div className="relative z-10 w-full h-full flex items-center justify-between
                      px-8 sm:px-14 md:px-20 gap-8 lg:gap-0">

        {/* ── Left column: text stack (layer 3 — fastest) ──────────── */}
        <div ref={textColRef} className="flex flex-col justify-center max-w-2xl flex-shrink-0"
          style={{ willChange: "transform" }}>

          {/* Availability tag */}
          <div ref={tagRef}
            className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full
                       border border-[var(--primary)]/25 bg-[var(--primary)]/5 backdrop-blur-sm self-start">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--primary)]" />
            </span>
            <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--primary)]/80 badge-font uppercase">
              {t.tag}
            </span>
          </div>

          {/* Name — information replacement from preloader center */}
          <h1 className="mb-3 overflow-hidden">
            <span ref={nameLineRef}
              className="block badge-font font-black uppercase italic text-[var(--primary)] will-change-transform"
              style={{ fontSize: "clamp(1.2rem,3vw,1.9rem)", letterSpacing: "0.07em" }}>
              Aoshi Blanco
            </span>
          </h1>

          {/* Role — two-line masked reveal */}
          <h2 className="badge-font font-black tracking-tighter text-white leading-[0.9] mb-10"
            style={{ fontSize: "clamp(2.8rem,8vw,6.5rem)" }}>
            <span className="block overflow-hidden">
              <span ref={roleLine1Ref} className="block will-change-transform">{roleLine1}</span>
            </span>
            {roleLine2 && (
              <span className="block overflow-hidden">
                <span ref={roleLine2Ref} className="block outline-text will-change-transform">{roleLine2}</span>
              </span>
            )}
          </h2>

          {/* CTA group — no bio */}
          <div ref={ctaGroupRef} className="flex flex-wrap items-center gap-5">
            <button ref={ctaBtnRef} aria-label="View work"
              onClick={() => document.getElementById("section-4")?.scrollIntoView({ behavior: "smooth" })}
              className="hero-cta relative group px-8 py-4 rounded-xl font-bold text-[#0b0e14] bg-white
                shadow-[0_0_40px_rgba(143,245,255,0.18)] hover:shadow-[0_0_64px_rgba(143,245,255,0.35)]
                transition-shadow duration-500 flex items-center gap-2 overflow-hidden">
              <span aria-hidden="true"
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                           transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
              <span className="relative z-10 flex items-center gap-2">
                {t.viewWork}
                <ChevronRight size={17} className="group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </button>

            <span aria-hidden="true" className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-5">
              <MagneticIcon href="https://github.com" ariaLabel="GitHub Profile"><Github size={22} /></MagneticIcon>
              <MagneticIcon href="https://linkedin.com" ariaLabel="LinkedIn Profile"><Linkedin size={22} /></MagneticIcon>
            </div>
          </div>

          {/* Scroll hint */}
          <div ref={scrollHintRef} aria-hidden="true" className="mt-14 flex items-center gap-3 text-white/20">
            <div className="flex flex-col gap-[3px]">
              {[0, 1, 2].map(i => (
                <span key={i} className="block w-4 h-[1.5px] bg-current rounded-full" style={{ opacity: 1 - i * 0.3 }} />
              ))}
            </div>
            <span className="text-[10px] tracking-[0.22em] badge-font uppercase">Scroll</span>
          </div>
        </div>

        {/* ── Right column: Hello World signature (layer 2) ─────────── */}
        {/*
          data-sig-target: the Preloader reads this via querySelector
          to compute exact flight coordinates for the coordinate transfer.
        */}
        <div
          ref={sigRef}
          data-sig-target
          aria-hidden="true"
          className="hidden lg:flex items-center justify-center flex-1 min-w-0"
          style={{ willChange: "transform, opacity" }}
        >
          <div className="relative" style={{ transform: "rotate(-11deg)", transformOrigin: "center" }}>
            {/* Faint bloom behind signature */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 50%, rgba(143,245,255,0.06) 0%, transparent 70%)",
                filter: "blur(32px)", transform: "scale(1.4)",
              }}
            />
            <svg
              ref={sigSvgRef}
              width="586" height="92" viewBox="0 0 586 92" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
              style={{
                maxWidth: "clamp(260px, 36vw, 520px)",
                filter: "drop-shadow(0 0 18px rgba(143,245,255,0.12))",
              }}
            >
              {HELLO_PATHS.map((d, i) => (
                <path key={i} className="hero-sig-path" d={d}
                  stroke="rgba(255,255,255,0.35)" strokeWidth="1"
                  fill="rgba(255,255,255,0.14)"
                  fillRule="evenodd"
                  style={{ willChange: "opacity, filter" }}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* ── HUD elements ─────────────────────────────────────────────── */}
      <div ref={hudBRRef} aria-hidden="true"
        className="pointer-events-none absolute bottom-12 right-14 hidden md:block
                   badge-font text-[10px] tracking-[0.18em] text-white/10 uppercase"
        style={{ willChange: "transform, opacity" }}>
        v1.0.0 — portfolio
      </div>

      <svg ref={hudBracketTRef} aria-hidden="true"
        className="pointer-events-none absolute top-8 left-8"
        width="28" height="28" viewBox="0 0 28 28"
        style={{ willChange: "transform, opacity" }}>
        <path d="M0 28 L0 0 L28 0" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.12" />
      </svg>

      <svg ref={hudBracketBRef} aria-hidden="true"
        className="pointer-events-none absolute bottom-8 right-8"
        width="28" height="28" viewBox="0 0 28 28"
        style={{ willChange: "transform, opacity" }}>
        <path d="M28 0 L28 28 L0 28" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.12" />
      </svg>
    </section>
  );
};
